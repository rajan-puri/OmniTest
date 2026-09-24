import React from "react";

export type StatusType = "passed" | "failed" | "running" | "queued" | "info" | "warn";

interface StatusPillProps {
  status: StatusType;
  label?: string;
  count?: number | string;
  animate?: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  count,
  animate = false,
  className = "",
}) => {
  const displayLabel = label || status.toUpperCase();

  const config = {
    passed: {
      color: "text-[#00E58F]",
      border: "border-[#00E58F]/30",
      bg: "bg-[#00E58F]/10",
      dot: "bg-[#00E58F]",
      icon: (
        <svg className="w-3 h-3 text-[#00E58F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    failed: {
      color: "text-[#F43F5E]",
      border: "border-[#F43F5E]/30",
      bg: "bg-[#F43F5E]/10",
      dot: "bg-[#F43F5E]",
      icon: (
        <svg className="w-3 h-3 text-[#F43F5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    running: {
      color: "text-[#F59E0B]",
      border: "border-[#F59E0B]/30",
      bg: "bg-[#F59E0B]/10",
      dot: "bg-[#F59E0B] animate-pulse",
      icon: (
        <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
      ),
    },
    queued: {
      color: "text-[#6B675E]",
      border: "border-white/[0.08]",
      bg: "bg-white/[0.04]",
      dot: "bg-[#6B675E]",
      icon: (
        <span className="w-1.5 h-1.5 rounded-full bg-[#6B675E]" />
      ),
    },
    info: {
      color: "text-[#38BDF8]",
      border: "border-[#38BDF8]/30",
      bg: "bg-[#38BDF8]/10",
      dot: "bg-[#38BDF8]",
      icon: (
        <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
      ),
    },
    warn: {
      color: "text-[#F59E0B]",
      border: "border-[#F59E0B]/30",
      bg: "bg-[#F59E0B]/10",
      dot: "bg-[#F59E0B]",
      icon: (
        <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
      ),
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] border font-mono text-[11px] font-semibold tracking-wider tabular-nums uppercase select-none transition-colors duration-200 ${
        config.color
      } ${config.border} ${config.bg} ${
        animate && status === "passed" ? "animate-pass-tick" : ""
      } ${className}`}
    >
      {config.icon}
      <span>{displayLabel}</span>
      {count !== undefined && (
        <span className="opacity-70 ml-0.5">({count})</span>
      )}
    </span>
  );
};
