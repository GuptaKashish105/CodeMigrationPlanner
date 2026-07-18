import { memo, useCallback, useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage("javascript", javascript);

function CopyIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h8a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L10.44 6.439A1.5 1.5 0 0 0 9.378 6H4.5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
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

function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function CodePanel({ title, filename, code, onCopy, copied, headerClass }) {
  return (
    <div className="code-panel flex flex-col overflow-hidden rounded-xl border border-white/10">
      <div className={`flex items-center justify-between gap-2 px-4 py-2.5 ${headerClass}`}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/80">{title}</span>
          <span className="truncate font-mono text-sm text-white">{filename}</span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90 transition-colors hover:bg-white/20"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="max-h-[560px] overflow-auto bg-[#282c34]">
        <SyntaxHighlighter
          language="javascript"
          style={atomOneDark}
          showLineNumbers
          wrapLongLines
          customStyle={{ margin: 0, padding: "1rem", fontSize: "0.8rem", background: "transparent" }}
        >
          {code || "// (empty)"}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

/**
 * Side-by-side before/after view for Phase 1 file conversions, with a
 * dropdown to switch between converted files.
 *
 * @param {{ conversions: Array<{
 *   filename: string,
 *   originalCode: string,
 *   convertedCode: string,
 *   migrationNotes?: string,
 * }> }} props
 */
function CodeConverter({ conversions }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(null); // 'original' | 'converted' | null

  const handleCopy = useCallback(async (text, which) => {
    try {
      await navigator.clipboard.writeText(text ?? "");
      setCopied(which);
      window.setTimeout(() => setCopied((c) => (c === which ? null : c)), 1500);
    } catch {
      // Clipboard API unavailable or permission denied — fail silently,
      // the button simply won't show the "Copied!" confirmation.
    }
  }, []);

  const current = conversions?.[selectedIndex];

  const handleDownload = useCallback(() => {
    if (!current) return;
    const base = current.filename.replace(/\.jsx?$/i, "");
    downloadTextFile(current.convertedCode ?? "", `${base}.react.js`);
  }, [current]);

  if (!conversions || conversions.length === 0 || !current) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-100">Phase 1 Conversions</h2>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="conversion-file-select" className="text-sm text-gray-400">
            File:
          </label>
          <select
            id="conversion-file-select"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-surface-light px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {conversions.map((c, i) => (
              <option key={c.filename} value={i}>
                {c.filename}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleDownload} className="btn-secondary text-sm">
            <DownloadIcon />
            Download .js
          </button>
        </div>
      </div>

      {current.migrationNotes && (
        <p className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-blue-200">
          {current.migrationNotes}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CodePanel
          title="Before · jQuery"
          filename={current.filename}
          code={current.originalCode}
          onCopy={() => handleCopy(current.originalCode, "original")}
          copied={copied === "original"}
          headerClass="bg-gray-700"
        />
        <CodePanel
          title="After · React"
          filename={current.filename}
          code={current.convertedCode}
          onCopy={() => handleCopy(current.convertedCode, "converted")}
          copied={copied === "converted"}
          headerClass="bg-blue-600/90"
        />
      </div>
    </div>
  );
}

export default memo(CodeConverter);
