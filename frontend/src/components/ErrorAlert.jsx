import { memo } from "react";

/**
 * Prominent, dismissible error banner. Errors from anywhere in the app
 * (validation, API failures, network errors) are funneled through this
 * single component so the user always sees failures in the same place.
 *
 * @param {{
 *   message: string,
 *   timestamp?: Date,
 *   onDismiss: () => void,
 *   onRetry?: () => void,
 * }} props
 */
function ErrorAlert({ message, timestamp, onDismiss, onRetry }) {
  if (!message) return null;

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div
      role="alert"
      className="animate-fade-in rounded-xl bg-danger text-white shadow-lg shadow-red-900/30 border border-red-400/30"
    >
      <div className="flex items-start gap-3 p-4">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.28 11.18c.75 1.335-.213 2.987-1.743 2.987H3.72c-1.53 0-2.493-1.652-1.743-2.987l6.28-11.18ZM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.25-6.5a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z"
            clipRule="evenodd"
          />
        </svg>

        <div className="min-w-0 flex-1">
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-0.5 break-words text-sm text-red-50/90">{message}</p>
          {formattedTime && (
            <p className="mt-1 text-xs text-red-100/70">at {formattedTime}</p>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium hover:bg-white/25 transition-colors"
            >
              Retry
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="flex-shrink-0 rounded-md p-1 text-red-100 hover:bg-white/15 hover:text-white transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default memo(ErrorAlert);
