"use client";

import React from "react";
import { Video, Download } from "lucide-react";
import { ArtifactItem } from "@/lib/artifacts/artifact-types";

interface VideoViewerProps {
  artifact: ArtifactItem;
}

export function VideoViewer({ artifact }: VideoViewerProps) {
  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.08] glass-panel">
      {/* Top Bar */}
      <div className="p-3 bg-black/60 border-b border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2 text-purple-400 font-bold">
          <Video className="w-4 h-4" />
          <span>Execution Video Recording ({artifact.fileName})</span>
        </div>
        <a
          href={artifact.downloadUrl}
          download={artifact.fileName}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs flex items-center gap-1.5 transition-colors font-medium"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Video</span>
        </a>
      </div>

      {/* Video Player */}
      <div className="flex-1 bg-black flex items-center justify-center p-4">
        <video
          src={artifact.url}
          controls
          autoPlay={false}
          playsInline
          className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Footer bar */}
      <div className="p-3 bg-black/60 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>
          Format: <strong className="text-white">{artifact.contentType}</strong>
        </span>
        <span>
          Size: <strong className="text-white">{artifact.formattedSize}</strong>
        </span>
      </div>
    </div>
  );
}
