import { memo, useCallback, useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const PREVIEW_LINE_COUNT = 12;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function UploadIcon() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4m0 0 4.5 4.5M12 4 7.5 8.5M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="h-5 w-5 flex-shrink-0 text-blue-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.914a2 2 0 0 0-.586-1.414l-3.914-3.914A2 2 0 0 0 12.086 2H4Zm3 9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H7Zm0 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Drag-and-drop upload zone for jQuery/.js files. Fully controlled: the
 * parent owns `files` and receives updates via `onFilesChange`.
 *
 * @param {{
 *   files: File[],
 *   onFilesChange: (files: File[]) => void,
 *   onAnalyze: () => void,
 *   onValidationError: (message: string) => void,
 *   loading: boolean,
 * }} props
 */
function FileUpload({ files, onFilesChange, onAnalyze, onValidationError, loading }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [previews, setPreviews] = useState({}); // filename -> preview text
  const [loadingPreview, setLoadingPreview] = useState(null);
  const dragCounter = useRef(0);
  const inputRef = useRef(null);

  const validateAndMerge = useCallback(
    (incoming) => {
      const errors = [];
      const accepted = [];

      for (const file of incoming) {
        if (!file.name.toLowerCase().endsWith(".js")) {
          errors.push(`"${file.name}" was skipped — only .js files are accepted.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          errors.push(
            `"${file.name}" was skipped — ${formatBytes(file.size)} exceeds the 5MB limit.`
          );
          continue;
        }
        accepted.push(file);
      }

      if (errors.length > 0) {
        onValidationError(errors.join(" "));
      }

      if (accepted.length > 0) {
        // Merge by filename so re-dropping a file replaces the old copy
        // instead of duplicating it in the list.
        const merged = new Map(files.map((f) => [f.name, f]));
        for (const file of accepted) merged.set(file.name, file);
        onFilesChange(Array.from(merged.values()));
      }
    },
    [files, onFilesChange, onValidationError]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      dragCounter.current = 0;
      setIsDragActive(false);
      if (loading) return;
      validateAndMerge(Array.from(event.dataTransfer.files ?? []));
    },
    [loading, validateAndMerge]
  );

  const handleDragEnter = useCallback(
    (event) => {
      event.preventDefault();
      if (loading) return;
      dragCounter.current += 1;
      setIsDragActive(true);
    },
    [loading]
  );

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleInputChange = useCallback(
    (event) => {
      validateAndMerge(Array.from(event.target.files ?? []));
      // Reset so selecting the same file again still fires onChange
      event.target.value = "";
    },
    [validateAndMerge]
  );

  const handleRemoveFile = useCallback(
    (name) => {
      onFilesChange(files.filter((f) => f.name !== name));
      setPreviews((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    },
    [files, onFilesChange]
  );

  const handleClearAll = useCallback(() => {
    onFilesChange([]);
    setPreviews({});
  }, [onFilesChange]);

  const togglePreview = useCallback(
    async (file) => {
      if (previews[file.name] !== undefined) {
        setPreviews((prev) => {
          const next = { ...prev };
          delete next[file.name];
          return next;
        });
        return;
      }
      setLoadingPreview(file.name);
      try {
        const text = await file.text();
        const lines = text.split("\n").slice(0, PREVIEW_LINE_COUNT);
        const truncated = text.split("\n").length > PREVIEW_LINE_COUNT;
        setPreviews((prev) => ({
          ...prev,
          [file.name]: lines.join("\n") + (truncated ? "\n…" : ""),
        }));
      } finally {
        setLoadingPreview(null);
      }
    },
    [previews]
  );

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="card">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !loading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !loading) inputRef.current?.click();
        }}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className={[
          "dropzone flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center",
          isDragActive ? "dropzone-active" : "border-gray-600 hover:border-gray-500",
          loading && "pointer-events-none opacity-60",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="text-blue-400">
          <UploadIcon />
        </span>
        <div>
          <p className="font-medium text-gray-100">
            Drag & drop <code className="rounded bg-black/30 px-1.5 py-0.5 text-sm">.js</code> files here
          </p>
          <p className="mt-1 text-sm text-gray-400">or click to browse — max 5MB per file</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".js"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {files.length} file{files.length !== 1 ? "s" : ""} selected · {formatBytes(totalSize)} total
            </p>
            <button type="button" onClick={handleClearAll} className="btn-ghost !px-2 !py-1 text-xs" disabled={loading}>
              Clear all
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {files.map((file) => (
              <li key={file.name} className="rounded-lg bg-black/20 px-3 py-2">
                <div className="flex items-center gap-3">
                  <FileIcon />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-100">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreview(file)}
                    disabled={loading}
                    className="btn-ghost !px-2 !py-1 text-xs"
                  >
                    {loadingPreview === file.name
                      ? "Loading…"
                      : previews[file.name] !== undefined
                        ? "Hide"
                        : "Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.name)}
                    disabled={loading}
                    aria-label={`Remove ${file.name}`}
                    className="btn-ghost !px-2 !py-1 text-xs text-red-300 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
                {previews[file.name] !== undefined && (
                  <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-black/40 p-3 text-xs text-gray-300">
                    {previews[file.name]}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={files.length === 0 || loading}
          className="btn-primary"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
              </svg>
              Analyzing…
            </>
          ) : (
            "Analyze Files"
          )}
        </button>
        <p className="text-xs text-gray-500">
          Tip: press <kbd className="rounded bg-black/30 px-1 py-0.5">Enter</kbd> to analyze,{" "}
          <kbd className="rounded bg-black/30 px-1 py-0.5">Esc</kbd> to clear
        </p>
      </div>
    </div>
  );
}

export default memo(FileUpload);
