import { memo } from "react";

const STEPS = [
  "Upload Files",
  "Analyze Code",
  "Map Dependencies",
  "Generate Roadmap",
  "Convert Code",
];

function CheckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
      />
    </svg>
  );
}

/**
 * Horizontal (vertical on mobile) 5-step workflow tracker.
 *
 * @param {{
 *   currentStep: number,        // 1-5, the step in focus
 *   completedSteps: number[],   // steps that finished successfully
 *   loading: boolean,           // whether currentStep is actively running
 * }} props
 */
function ProgressBar({ currentStep, completedSteps = [], loading = false }) {
  return (
    <ol className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isCompleted = completedSteps.includes(stepNum);
        const isActive = stepNum === currentStep && !isCompleted;
        const isLast = stepNum === STEPS.length;

        const circleClasses = [
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
          isCompleted && "border-success bg-success text-white",
          isActive && "border-primary bg-primary/10 text-primary",
          !isCompleted && !isActive && "border-gray-600 text-gray-500",
        ]
          .filter(Boolean)
          .join(" ");

        const labelClasses = [
          "whitespace-nowrap text-xs font-medium transition-colors duration-300 sm:text-sm",
          isCompleted && "text-success",
          isActive && "text-primary",
          !isCompleted && !isActive && "text-gray-500",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex items-center gap-3 sm:flex-col sm:gap-1.5 sm:text-center">
              <span className={circleClasses}>
                {isCompleted ? <CheckIcon /> : isActive && loading ? <SpinnerIcon /> : stepNum}
              </span>
              <span className={labelClasses}>{label}</span>
            </div>

            {!isLast && (
              <div
                className={[
                  "mx-2 hidden h-0.5 flex-1 rounded transition-colors duration-300 sm:mt-[-20px] sm:block",
                  isCompleted ? "bg-success" : "bg-gray-700",
                ].join(" ")}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default memo(ProgressBar);
