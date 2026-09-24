"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Search, ChevronDown, ChevronRight, FileCode2 } from "lucide-react";
import { ArtifactItem } from "@/lib/artifacts/artifact-types";

interface JsonViewerProps {
  artifact: ArtifactItem;
  content: string;
}

export function JsonViewer({ artifact, content }: JsonViewerProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFormatted, setIsFormatted] = useState<boolean>(true);

  // Parse and safely re-format
  const parsedData = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, [content]);

  const formattedText = useMemo(() => {
    if (!parsedData) return content;
    return isFormatted ? JSON.stringify(parsedData, null, 2) : JSON.stringify(parsedData);
  }, [parsedData, content, isFormatted]);

  const lines = useMemo(() => {
    return formattedText.split("\n");
  }, [formattedText]);

  const filteredLines = useMemo(() => {
    if (!searchQuery.trim()) return lines.map((text, idx) => ({ text, lineNum: idx + 1, matches: false }));
    const q = searchQuery.toLowerCase();
    return lines.map((text, idx) => ({
      text,
      lineNum: idx + 1,
      matches: text.toLowerCase().includes(q),
    }));
  }, [lines, searchQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              placeholder="Search JSON..."
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
            onClick={() => setIsFormatted(!isFormatted)}
            className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-white/10 border border-white/[0.08] text-zinc-300 text-xs transition-colors"
          >
            {isFormatted ? "Minify" : "Format"}
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
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="flex-1 overflow-auto bg-black/90 p-4 font-mono text-xs leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {filteredLines.map(({ text, lineNum, matches }) => (
              <tr
                key={lineNum}
                className={`hover:bg-white/[0.04] transition-colors ${
                  matches ? "bg-brand-500/15" : ""
                }`}
              >
                <td className="w-12 text-right pr-4 text-zinc-600 select-none font-mono text-[11px] align-top py-0.5">
                  {lineNum}
                </td>
                <td className="whitespace-pre overflow-x-auto text-zinc-200 font-mono py-0.5">
                  {text}
                </td>
              </tr>
            ))}
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
