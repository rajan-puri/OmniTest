"use client";

import React, { useState, useMemo } from "react";
import {
  FileCode2,
  Copy,
  Check,
  Zap,
  Eye,
  Search,
  Globe,
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { ArtifactItem } from "@/lib/artifacts/artifact-types";
import { JsonViewer } from "./JsonViewer";

interface EvidenceViewerProps {
  artifact: ArtifactItem;
  content: string;
}

export function EvidenceViewer({ artifact, content }: EvidenceViewerProps) {
  const [viewMode, setViewMode] = useState<"visual" | "raw">("visual");

  const parsedData = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, [content]);

  if (!parsedData || viewMode === "raw") {
    return <JsonViewer artifact={artifact} content={content} />;
  }

  // Specialized view for API artifacts
  if (artifact.type === "API_RESPONSE" || artifact.type === "API_REQUEST") {
    const isSuccess = (parsedData.httpStatus || 200) < 400;
    const req = parsedData.request || {};
    const res = parsedData.response || {};

    return (
      <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.08] glass-panel font-mono text-xs">
        {/* Toolbar */}
        <div className="p-3 bg-black/60 border-b border-white/[0.08] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                isSuccess
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              HTTP {parsedData.httpStatus || res.status || 200}
            </span>
            <span className="text-white font-bold">{parsedData.method || req.method || "GET"}</span>
            <span className="text-zinc-400 truncate max-w-sm">{parsedData.url || req.url || ""}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("raw")}
              className="px-2.5 py-1 rounded bg-black/40 hover:bg-white/10 text-zinc-300 border border-white/[0.08] transition-colors"
            >
              Raw JSON
            </button>
          </div>
        </div>

        {/* Content Body: Request & Response */}
        <div className="flex-1 overflow-auto p-4 space-y-4 bg-black/80">
          {/* Request Box */}
          <div className="p-4 rounded-xl glass-panel border border-white/[0.08] space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              HTTP Request Payload &amp; Headers
            </div>
            {parsedData.requestHeaders && (
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase">Headers (Masked):</span>
                <pre className="p-2.5 rounded bg-black/50 text-zinc-300 text-[11px] overflow-x-auto">
                  {JSON.stringify(parsedData.requestHeaders, null, 2)}
                </pre>
              </div>
            )}
            {req.body && (
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase">Body:</span>
                <pre className="p-2.5 rounded bg-black/50 text-zinc-300 text-[11px] overflow-x-auto">
                  {typeof req.body === "string" ? req.body : JSON.stringify(req.body, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Response Box */}
          <div className="p-4 rounded-xl glass-panel border border-white/[0.08] space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              HTTP Response Payload &amp; Headers
            </div>
            {parsedData.responseHeaders && (
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase">Headers:</span>
                <pre className="p-2.5 rounded bg-black/50 text-zinc-300 text-[11px] overflow-x-auto">
                  {JSON.stringify(parsedData.responseHeaders, null, 2)}
                </pre>
              </div>
            )}
            {res.body && (
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase">Response Body:</span>
                <pre className="p-2.5 rounded bg-black/50 text-zinc-200 text-[11px] overflow-x-auto">
                  {typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Specialized view for Performance Evidence
  if (artifact.type === "PERFORMANCE_EVIDENCE") {
    const vitals = parsedData.vitals || {};
    const metrics = parsedData.pageMetrics || {};

    return (
      <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.08] glass-panel font-mono text-xs">
        <div className="p-3 bg-black/60 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400 font-bold">
            <Zap className="w-4 h-4" />
            <span>Performance Audit Evidence</span>
          </div>
          <button
            onClick={() => setViewMode("raw")}
            className="px-2.5 py-1 rounded bg-black/40 hover:bg-white/10 text-zinc-300 border border-white/[0.08] transition-colors"
          >
            Raw JSON
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4 bg-black/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">LCP</span>
              <span className="text-xl font-bold text-white">
                {vitals.lcp?.value ? `${Math.round(vitals.lcp.value)}ms` : "—"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">CLS</span>
              <span className="text-xl font-bold text-white">
                {vitals.cls?.value !== undefined ? vitals.cls.value.toFixed(3) : "—"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">FCP</span>
              <span className="text-xl font-bold text-white">
                {metrics.fcpMs !== undefined ? `${Math.round(metrics.fcpMs)}ms` : "—"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl glass-panel border border-white/[0.08]">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">TTFB</span>
              <span className="text-xl font-bold text-white">
                {metrics.ttfbMs !== undefined ? `${Math.round(metrics.ttfbMs)}ms` : "—"}
              </span>
            </div>
          </div>

          {/* Raw Metrics Snippet */}
          <div className="p-3.5 rounded-xl glass-panel border border-white/[0.08]">
            <span className="text-[10px] text-zinc-500 uppercase block mb-2">Network &amp; Subresources</span>
            <pre className="p-3 rounded bg-black/60 text-zinc-300 text-[11px] overflow-x-auto">
              {JSON.stringify(parsedData.network || {}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Specialized view for Accessibility Evidence
  if (artifact.type === "A11Y_EVIDENCE") {
    const violations = parsedData.violations || [];

    return (
      <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.08] glass-panel font-mono text-xs">
        <div className="p-3 bg-black/60 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Eye className="w-4 h-4" />
            <span>Accessibility Audit Evidence ({violations.length} Violations)</span>
          </div>
          <button
            onClick={() => setViewMode("raw")}
            className="px-2.5 py-1 rounded bg-black/40 hover:bg-white/10 text-zinc-300 border border-white/[0.08] transition-colors"
          >
            Raw JSON
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3 bg-black/80">
          {violations.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              Zero accessibility violations detected in this audit.
            </div>
          ) : (
            violations.map((v: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl glass-panel border border-rose-500/20 bg-rose-500/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300">{v.id}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400">
                    {v.impact || "minor"}
                  </span>
                </div>
                <p className="text-zinc-300 text-xs font-sans">{v.description || v.help}</p>
                {v.nodes && v.nodes.length > 0 && (
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Impacted node: <code className="text-zinc-300 bg-black/40 px-1 py-0.5 rounded">{v.nodes[0].target?.join(", ")}</code>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Specialized view for SEO Evidence
  if (artifact.type === "SEO_EVIDENCE") {
    return (
      <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.08] glass-panel font-mono text-xs">
        <div className="p-3 bg-black/60 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-400 font-bold">
            <Search className="w-4 h-4" />
            <span>Technical SEO Evidence</span>
          </div>
          <button
            onClick={() => setViewMode("raw")}
            className="px-2.5 py-1 rounded bg-black/40 hover:bg-white/10 text-zinc-300 border border-white/[0.08] transition-colors"
          >
            Raw JSON
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3 bg-black/80">
          <div className="p-3.5 rounded-xl glass-panel border border-white/[0.08] space-y-2">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase">Page Title:</span>
              <p className="text-white font-medium">{parsedData.title || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase">Canonical URL:</span>
              <p className="text-zinc-300">{parsedData.canonical || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase">Robots Directives:</span>
              <p className="text-zinc-300">{JSON.stringify(parsedData.robots || "index, follow")}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl glass-panel border border-white/[0.08]">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Findings Summary:</span>
            <pre className="p-2.5 rounded bg-black/60 text-zinc-300 text-[11px] overflow-x-auto">
              {JSON.stringify(parsedData.findings || parsedData.checks || {}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Specialized view for Network Failures / Logs
  if (artifact.type === "NETWORK_LOG" && Array.isArray(parsedData)) {
    return (
      <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/[0.08] glass-panel font-mono text-xs">
        <div className="p-3 bg-black/60 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <Globe className="w-4 h-4" />
            <span>Network Failures &amp; HTTP Logs ({parsedData.length})</span>
          </div>
          <button
            onClick={() => setViewMode("raw")}
            className="px-2.5 py-1 rounded bg-black/40 hover:bg-white/10 text-zinc-300 border border-white/[0.08] transition-colors"
          >
            Raw JSON
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-black/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-500 font-mono text-[10px] uppercase">
                <th className="p-3">Method</th>
                <th className="p-3">URL</th>
                <th className="p-3">Status / Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {parsedData.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="p-3 text-brand-400 font-bold">{item.method || "GET"}</td>
                  <td className="p-3 text-zinc-200 truncate max-w-md">{item.url}</td>
                  <td className="p-3 text-rose-400 font-bold">{item.error || item.status || "Failed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback to standard JsonViewer
  return <JsonViewer artifact={artifact} content={content} />;
}
