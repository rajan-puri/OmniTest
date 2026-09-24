import React from "react";

export type TestExecutionStatus = "PASSED" | "FAILED" | "RUNNING" | "QUEUED" | "TIMED_OUT" | "CANCELLED" | string;

interface StatusBadgeProps {
  status: TestExecutionStatus;
  size?: "sm" | "md";
  showDotOnly?: boolean;
  className?: string;
}

export function StatusBadge({ status, size = "md", showDotOnly = false, className = "" }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  let dotColor = "bg-zinc-500";
  let textColor = "text-zinc-400";
  let label = status || "UNKNOWN";

  if (normalized === "PASSED" || normalized === "PASS" || normalized === "SUCCESS") {
    dotColor = "bg-emerald-400";
    textColor = "text-emerald-400";
    label = "Passed";
  } else if (normalized === "FAILED" || normalized === "FAIL" || normalized === "FAILURE") {
    dotColor = "bg-rose-400";
    textColor = "text-rose-400";
    label = "Failed";
  } else if (normalized === "RUNNING") {
    dotColor = "bg-amber-400 animate-pulse";
    textColor = "text-amber-400";
    label = "Running";
  } else if (normalized === "QUEUED") {
    dotColor = "bg-blue-400";
    textColor = "text-blue-400";
    label = "Queued";
  } else if (normalized === "TIMED_OUT") {
    dotColor = "bg-orange-400";
    textColor = "text-orange-400";
    label = "Timed Out";
  } else if (normalized === "CANCELLED") {
    dotColor = "bg-zinc-500";
    textColor = "text-zinc-400";
    label = "Cancelled";
  }

  if (showDotOnly) {
    return (
      <span
        title={label}
        className={`inline-block rounded-full ${size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"} ${dotColor} ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${
        size === "sm" ? "text-[11px]" : "text-xs"
      } ${textColor} ${className}`}
    >
      <span className={`inline-block rounded-full ${size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"} ${dotColor} shrink-0`} />
      <span>{label}</span>
    </span>
  );
}
