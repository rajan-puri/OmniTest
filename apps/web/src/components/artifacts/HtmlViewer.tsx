"use client";

import React, { useState } from "react";
import { ShieldCheck, ExternalLink, RefreshCw } from "lucide-react";
import { ArtifactItem } from "@/lib/artifacts/artifact-types";

interface HtmlViewerProps {
  artifact: ArtifactItem;
  content: string;
}

export function HtmlViewer({ artifact, content }: HtmlViewerProps) {
  const [iframeKey, setIframeKey] = useState<number>(0);

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.08] glass-panel">
      {/* Top Security Banner */}
      <div className="p-3 bg-black/60 border-b border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Sandboxed HTML Environment (Isolated iframe, scripts &amp; parent access blocked)</span>
        </div>
        <button
          onClick={() => setIframeKey((prev) => prev + 1)}
          className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
          title="Reload iframe"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {/* Sandboxed iframe */}
      <div className="flex-1 bg-white relative">
        <iframe
          key={iframeKey}
          srcDoc={content}
          title={artifact.fileName}
          sandbox="" // Maximum isolation: No scripts, no top navigation, no forms, no popups
          className="w-full h-full border-0 absolute inset-0"
        />
      </div>

      {/* Footer bar */}
      <div className="p-3 bg-black/60 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>
          Format: <strong className="text-white">HTML Document</strong>
        </span>
        <span>
          Size: <strong className="text-white">{artifact.formattedSize}</strong>
        </span>
      </div>
    </div>
  );
}
