"use client";

import React, { useState } from "react";
import { Download, Copy, Check, ExternalLink, Terminal, Layers } from "lucide-react";
import { ArtifactItem } from "@/lib/artifacts/artifact-types";

interface TraceViewerProps {
  artifact: ArtifactItem;
}

export function TraceViewer({ artifact }: TraceViewerProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const command = `npx playwright show-trace ${artifact.fileName}`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.08] glass-panel">
      {/* Top Bar */}
      <div className="p-3 bg-black/60 border-b border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2 text-brand-400 font-bold">
          <Layers className="w-4 h-4" />
          <span>Playwright Execution Trace (.zip)</span>
        </div>
        <a
          href={artifact.downloadUrl}
          download={artifact.fileName}
          className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Trace Archive</span>
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 sm:p-10 flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shadow-xl">
          <Layers className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">{artifact.fileName}</h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
            Playwright trace archives contain full DOM snapshot timelines, network logs, and console events recorded during test execution.
          </p>
        </div>

        {/* Local Command Box */}
        <div className="w-full p-4 rounded-xl bg-black/60 border border-white/[0.1] text-left space-y-2 font-mono text-xs">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Terminal className="w-3.5 h-3.5" /> Inspect locally via Playwright CLI:
            </span>
            <button
              onClick={handleCopyCmd}
              className="text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-2.5 rounded-lg bg-black/80 text-brand-300 overflow-x-auto select-all">
            {command}
          </pre>
        </div>

        {/* Web Trace Viewer Link */}
        <div className="pt-2">
          <a
            href="https://trace.playwright.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs border border-white/[0.08] transition-colors"
          >
            <span>Open Playwright Web Trace Viewer</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </div>
      </div>

      {/* Footer bar */}
      <div className="p-3 bg-black/60 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>
          Archive Type: <strong className="text-white">application/zip</strong>
        </span>
        <span>
          File Size: <strong className="text-white">{artifact.formattedSize}</strong>
        </span>
      </div>
    </div>
  );
}
