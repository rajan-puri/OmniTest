import React from "react";

interface EngineBadgeProps {
  type: "UI" | "API" | "ACCESSIBILITY" | "PERFORMANCE" | "SEO" | "VISUAL" | string;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function EngineBadge({ type, size = "sm", className = "" }: EngineBadgeProps) {
  const norm = (type || "").toUpperCase();

  let shortLabel = norm;
  let colorStyles = "bg-zinc-800/80 text-zinc-300 border-zinc-700/60";

  switch (norm) {
    case "UI":
    case "BROWSER":
      shortLabel = "BROWSER";
      colorStyles = "bg-blue-950/40 text-blue-300 border-blue-800/40";
      break;
    case "API":
      shortLabel = "API";
      colorStyles = "bg-emerald-950/40 text-emerald-300 border-emerald-800/40";
      break;
    case "ACCESSIBILITY":
    case "A11Y":
      shortLabel = "A11Y";
      colorStyles = "bg-amber-950/40 text-amber-300 border-amber-800/40";
      break;
    case "PERFORMANCE":
    case "PERF":
      shortLabel = "PERF";
      colorStyles = "bg-purple-950/40 text-purple-300 border-purple-800/40";
      break;
    case "SEO":
      shortLabel = "SEO";
      colorStyles = "bg-teal-950/40 text-teal-300 border-teal-800/40";
      break;
    case "VISUAL":
    case "VISUAL_REGRESSION":
      shortLabel = "VISUAL";
      colorStyles = "bg-pink-950/40 text-pink-300 border-pink-800/40";
      break;
  }

  const sizeStyles =
    size === "xs"
      ? "text-[9px] px-1 py-0.5 tracking-wider"
      : size === "sm"
      ? "text-[10px] px-1.5 py-0.5 tracking-wider"
      : "text-[11px] px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border ${sizeStyles} ${colorStyles} ${className}`}
    >
      {shortLabel}
    </span>
  );
}
