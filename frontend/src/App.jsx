import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

import FileUpload from "./components/FileUpload.jsx";
import RoadmapDisplay from "./components/RoadmapDisplay.jsx";
import CodeConverter from "./components/CodeConverter.jsx";
import ProgressBar from "./components/ProgressBar.jsx";
import ErrorAlert from "./components/ErrorAlert.jsx";
import { analyzeFiles, getDependencies, getRoadmap, convertCode } from "./services/api.js";

/**
 * Finds the original source for a roadmap file entry. Claude is given the
 * uploaded filename explicitly when analyzing, so `file_name` in the
 * roadmap normally matches a key in `contents` exactly — the fallback
 * below only kicks in if the model returns a slightly different string
 * (e.g. a path prefix) than what was uploaded.
 */
function findOriginalCode(contents, fileName) {
  if (contents[fileName] !== undefined) return contents[fileName];
  const target = fileName.toLowerCase();
  const matchKey = Object.keys(contents).find((name) => {
    const lower = name.toLowerCase();
    return lower === target || lower.endsWith(`/${target}`) || target.endsWith(`/${lower}`);
  });
  return matchKey ? contents[matchKey] : null;
}

function App() {
  const [files, setFiles] = useState([]);

  const [analyses, setAnalyses] = useState(null);
  const [dependencyMap, setDependencyMap] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [conversions, setConversions] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [error, setError] = useState(null); // { message, timestamp }
  const [successMessage, setSuccessMessage] = useState(null);

  const completedSteps = useMemo(() => {
    const steps = [];
    if (files.length > 0) steps.push(1);
    if (analyses) steps.push(2);
    if (dependencyMap) steps.push(3);
    if (roadmap) steps.push(4);
    if (conversions) steps.push(5);
    return steps;
  }, [files, analyses, dependencyMap, roadmap, conversions]);

  const resetResults = useCallback(() => {
    setAnalyses(null);
    setDependencyMap(null);
    setRoadmap(null);
    setConversions(null);
    setCurrentStep(1);
  }, []);

  const handleFilesChange = useCallback(
    (newFiles) => {
      setFiles(newFiles);
      setError(null);
      setSuccessMessage(null);
      // Any existing results belong to the previous file set — drop them
      // rather than showing a stale roadmap next to a new upload.
      if (analyses || roadmap || conversions) {
        resetResults();
      }
    },
    [analyses, roadmap, conversions, resetResults]
  );

  const handleValidationError = useCallback((message) => {
    setError({ message, timestamp: new Date() });
  }, []);

  const handleClearFiles = useCallback(() => {
    if (loading) return;
    setFiles([]);
    setError(null);
    setSuccessMessage(null);
    resetResults();
  }, [loading, resetResults]);

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0 || loading) return;

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // Read every file once up front — reused both for the analyze call
      // and later as the "before" source for CodeConverter.
      const contents = {};
      await Promise.all(
        files.map(async (file) => {
          contents[file.name] = await file.text();
        })
      );

      setCurrentStep(2);
      setLoadingLabel("Analyzing files with Claude…");
      const { analyses: newAnalyses } = await analyzeFiles(files);
      setAnalyses(newAnalyses);

      setCurrentStep(3);
      setLoadingLabel("Mapping dependencies…");
      const newDependencyMap = await getDependencies(newAnalyses);
      setDependencyMap(newDependencyMap);

      setCurrentStep(4);
      setLoadingLabel("Generating migration roadmap…");
      const newRoadmap = await getRoadmap(newAnalyses, newDependencyMap);
      setRoadmap(newRoadmap);

      setCurrentStep(5);
      setLoadingLabel("Converting Phase 1 files to React…");
      const phase1Files = newRoadmap.phases?.find((p) => p.phase === 1)?.files ?? [];
      const results = await Promise.all(
        phase1Files.map(async (file) => {
          const originalCode = findOriginalCode(contents, file.file_name);
          if (originalCode === null) {
            console.warn(`No uploaded source found for "${file.file_name}" — skipping conversion.`);
            return null;
          }
          const converted = await convertCode(file.file_name, originalCode);
          return {
            filename: file.file_name,
            originalCode,
            convertedCode: converted.convertedCode,
            migrationNotes: converted.migrationNotes,
          };
        })
      );
      const validConversions = results.filter(Boolean);
      setConversions(validConversions);

      setSuccessMessage(
        `Done! Generated a ${newRoadmap.phases?.length ?? 0}-phase roadmap and converted ` +
          `${validConversions.length} Phase 1 file${validConversions.length === 1 ? "" : "s"} to React.`
      );
    } catch (err) {
      setError({ message: err.message, timestamp: new Date() });
    } finally {
      setLoading(false);
      setLoadingLabel("");
    }
  }, [files, loading]);

  // Keyboard shortcuts: Enter to analyze, Escape to clear — ignored while
  // focus is in a form control so they don't fight normal typing/selection.
  useEffect(() => {
    function handleKeyDown(event) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (event.key === "Enter" && files.length > 0 && !loading) {
        event.preventDefault();
        handleAnalyze();
      } else if (event.key === "Escape" && !loading) {
        handleClearFiles();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [files, loading, handleAnalyze, handleClearFiles]);

  // Auto-dismiss the success banner after a few seconds.
  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = window.setTimeout(() => setSuccessMessage(null), 6000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  return (
    <div className="app-shell">
      <header className="border-b border-white/5 bg-black/20">
        <div className="app-container flex flex-col gap-1 py-6">
          <h1 className="text-2xl font-bold text-gray-50 sm:text-3xl">
            Code<span className="text-primary">Migration</span>Planner
          </h1>
          <p className="text-sm text-gray-400">
            Analyze jQuery codebases and generate React migration roadmaps with Claude AI
          </p>
        </div>
      </header>

      <main className="app-container flex flex-1 flex-col gap-6 py-8">
        <div className="card">
          <ProgressBar currentStep={currentStep} completedSteps={completedSteps} loading={loading} />
          {loading && loadingLabel && (
            <p className="mt-4 text-center text-sm text-primary">{loadingLabel}</p>
          )}
        </div>

        {error && (
          <ErrorAlert
            message={error.message}
            timestamp={error.timestamp}
            onDismiss={() => setError(null)}
            onRetry={files.length > 0 ? handleAnalyze : undefined}
          />
        )}

        {successMessage && (
          <div className="animate-fade-in flex items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-emerald-200">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              aria-label="Dismiss"
              className="text-emerald-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <FileUpload
          files={files}
          onFilesChange={handleFilesChange}
          onAnalyze={handleAnalyze}
          onValidationError={handleValidationError}
          loading={loading}
        />

        {roadmap && <RoadmapDisplay roadmap={roadmap} />}

        {conversions && conversions.length > 0 && <CodeConverter conversions={conversions} />}
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-xs text-gray-600">
        CodeMigrationPlanner — connects to the backend on http://localhost:3001
      </footer>
    </div>
  );
}

export default App;
