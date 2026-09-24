"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Search, WrapText, Terminal } from "lucide-react";
import { ArtifactItem } from "@/lib/artifacts/artifact-types";

interface LogViewerProps {
  artifact: ArtifactItem;
  content: string;
}

export function LogViewer({ artifact, content }: LogViewerProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [wrapText, setWrapText] = useState<boolean>(true);

  const lines = useMemo(() => {
    return content ? content.split("\n") : [];
  }, [content]);

  const filteredLines = useMemo(() => {
    if (!searchQuery.trim()) {
      return lines.map((text, idx) => ({ text, lineNum: idx + 1, matches: false }));
    }
    const q = searchQuery.toLowerCase();
    return lines.map((text, idx) => ({
      text,
      lineNum: idx + 1,
      matches: text.toLowerCase().includes(q),
    }));
  }, [lines, searchQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLineClass = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("error") || lower.includes("failed") || lower.includes("fail")) {
      return "text-rose-400";
    }
    if (lower.includes("warn") || lower.includes("timeout")) {
      return "text-amber-400";
    }
    if (lower.includes("pass") || lower.includes("ok") || lower.includes("success")) {
      return "text-emerald-400";
    }
    return "text-zinc-200";
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.08] glass-panel">
      {/* Top Toolbar */}
      <div className="p-3 bg-black/60 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-black/40 border border-white/[0.1] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 w-48 sm:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setWrapText(!wrapText)}
            className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              wrapText
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                : "bg-black/40 hover:bg-white/10 text-zinc-300 border-white/[0.08]"
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
            <span>Wrap</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 transition-colors font-medium text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Logs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="flex-1 overflow-auto bg-black/90 p-4 font-mono text-xs leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {filteredLines.map(({ text, lineNum, matches }) => {
              const formattedLineNum = lineNum.toString().padStart(3, "0");

              return (
                <tr
                  key={lineNum}
                  className={`hover:bg-white/[0.04] transition-colors ${
                    matches ? "bg-brand-500/15" : ""
                  }`}
                >
                  <td className="w-12 text-right pr-4 text-zinc-600 select-none font-mono text-[11px] align-top py-0.5">
                    {formattedLineNum}
                  </td>
                  <td
                    className={`font-mono py-0.5 ${getLineClass(text)} ${
                      wrapText ? "whitespace-pre-wrap break-all" : "whitespace-pre overflow-x-auto"
                    }`}
                  >
                    {text || " "}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="p-3 bg-black/60 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>
          Total Lines: <strong className="text-white">{lines.length}</strong>
        </span>
        <span>
          Size: <strong className="text-white">{artifact.formattedSize}</strong>
        </span>
      </div>
    </div>
  );
}
