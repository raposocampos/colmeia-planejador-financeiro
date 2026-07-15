interface ProgressBarProps {
  value: number;
  label: string;
  tone?: "normal" | "warning" | "exceeded" | "goal";
}

export function ProgressBar({ value, label, tone = "normal" }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(value, 100));
  return (
    <div
      className={"progress progress--" + tone}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <span style={{ width: safeValue + "%" }} />
    </div>
  );
}
