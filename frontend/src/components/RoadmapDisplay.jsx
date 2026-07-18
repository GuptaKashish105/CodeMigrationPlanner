import { memo, useCallback } from "react";

const RISK_BADGE = {
  LOW: "bg-success/15 text-success border border-success/30",
  MEDIUM: "bg-warning/15 text-warning border border-warning/30",
  HIGH: "bg-danger/15 text-danger border border-danger/30",
};

const PHASE_ACCENT = {
  1: { text: "text-success", bg: "bg-success", ring: "hover:ring-success/40" },
  2: { text: "text-warning", bg: "bg-warning", ring: "hover:ring-warning/40" },
  3: { text: "text-danger", bg: "bg-danger", ring: "hover:ring-danger/40" },
};

function RiskBadge({ level }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        RISK_BADGE[level] ?? "bg-gray-600/30 text-gray-300 border border-gray-500/30"
      }`}
    >
      {level ?? "UNKNOWN"}
    </span>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * @param {{ roadmap: {
 *   phases: Array<{phase:number,title:string,files:Array<object>,total_effort_hours:number,total_risk:string}>,
 *   breaking_changes_by_phase?: Record<string,string[]>,
 *   total_effort_hours: number,
 *   estimated_duration_weeks: number,
 *   critical_path?: string[],
 * } }} props
 */
function RoadmapDisplay({ roadmap }) {
  const handleDownload = useCallback(() => {
    downloadJSON(roadmap, "migration-roadmap.json");
  }, [roadmap]);

  if (!roadmap || !Array.isArray(roadmap.phases)) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-100">Migration Roadmap</h2>
        <button type="button" onClick={handleDownload} className="btn-secondary text-sm">
          <DownloadIcon />
          Export JSON
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {roadmap.phases.map((phase) => {
          const accent = PHASE_ACCENT[phase.phase] ?? PHASE_ACCENT[1];
          const breakingChanges =
            roadmap.breaking_changes_by_phase?.[`phase_${phase.phase}`] ?? [];

          return (
            <div
              key={phase.phase}
              className={`card flex flex-col gap-4 ring-1 ring-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${accent.ring}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${accent.bg}`} />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Phase {phase.phase}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-semibold text-gray-100">{phase.title}</h3>
              </div>

              <ul className="flex flex-col gap-3">
                {(phase.files ?? []).map((file) => (
                  <li key={file.file_name} className="rounded-lg bg-black/20 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate font-mono text-sm text-gray-100">{file.file_name}</span>
                      <RiskBadge level={file.risk_level} />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{file.effort_hours ?? 0}h estimated effort</p>
                    <p
                      title={file.migration_strategy}
                      className="mt-1.5 truncate text-xs text-gray-300"
                    >
                      {file.migration_strategy}
                    </p>
                  </li>
                ))}
              </ul>

              {breakingChanges.length > 0 && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-3">
                  <p className="text-xs font-semibold text-danger">⚠ Breaking changes</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-red-200/90">
                    {breakingChanges.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 text-sm">
                <span className="text-gray-400">
                  {phase.total_effort_hours ?? 0}h total
                </span>
                <RiskBadge level={phase.total_risk} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Total effort</p>
            <p className="text-lg font-semibold text-gray-100">{roadmap.total_effort_hours ?? 0} hours</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Estimated duration</p>
            <p className="text-lg font-semibold text-gray-100">
              {roadmap.estimated_duration_weeks ?? 0} weeks
            </p>
          </div>
        </div>

        {Array.isArray(roadmap.critical_path) && roadmap.critical_path.length > 0 && (
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs uppercase tracking-wide text-gray-500">Critical path</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {roadmap.critical_path.map((name) => (
                <span
                  key={name}
                  className="rounded-md bg-primary/15 px-2 py-0.5 font-mono text-xs text-blue-300"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(RoadmapDisplay);
