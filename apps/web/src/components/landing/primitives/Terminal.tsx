"use client";

import React, { useState } from "react";

interface TerminalProps {
  title?: string;
  command?: string;
  lines?: {
    prompt?: string;
    text: string;
    type?: "command" | "output" | "pass" | "fail" | "dim" | "highlight";
    time?: string;
  }[];
  children?: React.ReactNode;
  className?: string;
  copyable?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
  title = "zsh — omnitest",
  command,
  lines,
  children,
  className = "",
  copyable = true,
}) => {
  const [copied, setCopied] = useState(false);

  const fullTextToCopy = command
    ? command
    : lines
    ? lines.map((l) => (l.prompt ? `${l.prompt} ${l.text}` : l.text)).join("\n")
    : "";

  const handleCopy = () => {
    if (!fullTextToCopy) return;
    navigator.clipboard.writeText(fullTextToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`w-full rounded-[6px] border border-white/[0.08] bg-[#161512] font-mono text-[14px] leading-relaxed overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[#1D1B17] border-b border-white/[0.08] select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
          <span className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
          <span className="w-2.5 h-2.5 rounded-full border border-white/20 bg-white/5" />
          <span className="ml-2 text-[13px] text-[#A29E94]">{title}</span>
        </div>
        {copyable && fullTextToCopy && (
          <button
            onClick={handleCopy}
            type="button"
            className="text-[12px] px-2.5 py-1 rounded-[4px] border border-white/[0.1] text-[#A29E94] hover:text-[#F5F3EE] hover:border-white/[0.22] hover:bg-white/[0.04] transition-all flex items-center gap-1.5"
            aria-label="Copy terminal content"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-[#00E58F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[#00E58F]">COPIED</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>COPY</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="p-4 md:p-6 overflow-x-auto text-[#F5F3EE] space-y-2">
        {lines
          ? lines.map((l, idx) => {
              const color =
                l.type === "command"
                  ? "text-[#F5F3EE] font-medium"
                  : l.type === "pass"
                  ? "text-[#00E58F]"
                  : l.type === "fail"
                  ? "text-[#F43F5E]"
                  : l.type === "highlight"
                  ? "text-[#38BDF8]"
                  : l.type === "dim"
                  ? "text-[#6B675E]"
                  : "text-[#A29E94]";

              return (
                <div key={idx} className="flex items-start justify-between gap-4 font-mono text-[14px]">
                  <div className="flex items-start gap-2.5">
                    {l.prompt && (
                      <span className="text-[#00E58F] font-semibold shrink-0 select-none">
                        {l.prompt}
                      </span>
                    )}
                    <span className={color}>{l.text}</span>
                  </div>
                  {l.time && (
                    <span className="text-[12px] text-[#6B675E] shrink-0 tabular-nums select-none">
                      {l.time}
                    </span>
                  )}
                </div>
              );
            })
          : children}
      </div>
    </div>
  );
};
