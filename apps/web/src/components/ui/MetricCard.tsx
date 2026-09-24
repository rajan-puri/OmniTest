import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  status?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function MetricCard({ label, value, subtext, status = "default", className = "" }: MetricCardProps) {
  let valueColor = "text-white";
  if (status === "success") valueColor = "text-emerald-400";
  else if (status === "error") valueColor = "text-rose-400";
  else if (status === "warning") valueColor = "text-amber-400";

  return (
    <div className={`p-4 bg-[#111319] border border-white/[0.08] rounded-md flex flex-col justify-between ${className}`}>
      <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider block">
        {label}
      </span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-2xl font-bold font-mono tracking-tight ${valueColor}`}>{value}</span>
      </div>
      {subtext && <span className="text-[11px] text-zinc-500 mt-1 block truncate">{subtext}</span>}
    </div>
  );
}
