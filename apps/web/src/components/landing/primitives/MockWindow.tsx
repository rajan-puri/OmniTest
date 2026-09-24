import React from "react";

interface MockWindowProps {
  title?: string;
  badge?: string;
  badgeVariant?: "mint" | "fail" | "warn" | "neutral";
  telemetry?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  light?: boolean;
}

export const MockWindow: React.FC<MockWindowProps> = ({
  title = "omnitest-runner",
  badge,
  badgeVariant = "mint",
  telemetry,
  children,
  className = "",
  bodyClassName = "",
  light = false,
}) => {
  const badgeColors = {
    mint: "text-[#00E58F] border-[#00E58F]/30 bg-[#00E58F]/10",
    fail: "text-[#F43F5E] border-[#F43F5E]/30 bg-[#F43F5E]/10",
    warn: "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10",
    neutral: "text-[#A29E94] border-white/10 bg-white/5",
  }[badgeVariant];

  if (light) {
    return (
      <div
        className={`w-full rounded-[6px] border border-[#14130F]/14 bg-white text-[#14130F] overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#E8E5DD] border-b border-[#14130F]/10 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border border-[#14130F]/25 bg-transparent" />
            <span className="w-2.5 h-2.5 rounded-full border border-[#14130F]/25 bg-transparent" />
            <span className="w-2.5 h-2.5 rounded-full border border-[#14130F]/25 bg-transparent" />
            <span className="ml-2 font-mono text-[13px] text-[#5C584E] font-medium tracking-tight">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {badge && (
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] border border-[#14130F]/20 text-[#14130F] font-semibold uppercase">
                {badge}
              </span>
            )}
            {telemetry}
          </div>
        </div>
        <div className={`p-4 md:p-6 text-[14px] leading-relaxed ${bodyClassName}`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-[6px] border border-white/[0.08] bg-[#161512] text-[#F5F3EE] overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[#1D1B17] border-b border-white/[0.08] select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
          <span className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
          <span className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
          <span className="ml-2 font-mono text-[13px] text-[#A29E94] tracking-tight">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {badge && (
            <span
              className={`font-mono text-[11px] px-2 py-0.5 rounded-[4px] border font-semibold uppercase tracking-wider ${badgeColors}`}
            >
              {badge}
            </span>
          )}
          {telemetry}
        </div>
      </div>
      <div className={`p-4 md:p-6 text-[14px] leading-relaxed ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};
