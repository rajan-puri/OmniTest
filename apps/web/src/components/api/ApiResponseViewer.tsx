"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  FileCode2,
  Copy,
  Check,
  Code,
  ShieldCheck,
} from "lucide-react";
import { ApiExecutionResult } from "@/lib/runner/api-types";

interface ApiResponseViewerProps {
  result: ApiExecutionResult;
}

export function ApiResponseViewer({ result }: ApiResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<"body" | "headers" | "assertions" | "request">("body");
  const [copied, setCopied] = useState(false);

  const isPassed = result.status === "PASSED";
  const statusCode = result.statusCode || (result.response ? result.response.statusCode : 0);
  const statusText = result.statusText || (result.response ? result.response.statusText : "");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    if (!statusCode) {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-300 font-mono text-xs font-bold">
          CONNECTION ERROR
        </span>
      );
    }

    let color = "bg-zinc-800 text-zinc-300 border-zinc-700";
    if (statusCode >= 200 && statusCode < 300) {
      color = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    } else if (statusCode >= 400 && statusCode < 500) {
      color = "bg-amber-500/15 text-amber-300 border-amber-500/30";
    } else if (statusCode >= 500) {
      color = "bg-rose-500/15 text-rose-300 border-rose-500/30";
    }

    return (
      <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border ${color}`}>
        {statusCode} {statusText}
      </span>
    );
  };

  // Format JSON response safely
  let formattedBody = result.response?.body || "";
  if (result.response?.isJson && result.response.jsonParsed) {
    try {
      formattedBody = JSON.stringify(result.response.jsonParsed, null, 2);
    } catch {
      // keep raw body
    }
  }

  return (
    <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] overflow-hidden">
      {/* Top Status Bar */}
      <div className="p-4 bg-zinc-950/80 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {getStatusBadge()}

          <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{result.durationMs}ms</span>
          </div>

          {result.response && (
            <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
              <span>•</span>
              <span>{(result.response.sizeBytes / 1024).toFixed(1)} KB</span>
            </div>
          )}
        </div>

        {/* Assertions Summary */}
        <div className="flex items-center gap-2">
          {isPassed ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {result.passedAssertions}/{result.totalAssertions} ASSERTIONS PASSED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs font-mono font-bold">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              {result.failedAssertions} ASSERTION FAILED
            </span>
          )}
        </div>
      </div>

      {/* Failure Callout banner if failed */}
      {!isPassed && result.errorSummary && (
        <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-xs font-mono text-rose-300 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-400">
            <XCircle className="w-4 h-4" />
            Test Execution Failure
          </div>
          <p className="text-rose-200/90">{result.errorSummary}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 text-xs font-mono pt-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("body")}
            className={`px-3 py-1.5 rounded-t-lg transition-colors ${
              activeTab === "body"
                ? "bg-white/[0.08] text-white font-bold border-b-2 border-brand-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Response Body
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("headers")}
            className={`px-3 py-1.5 rounded-t-lg transition-colors ${
              activeTab === "headers"
                ? "bg-white/[0.08] text-white font-bold border-b-2 border-brand-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Headers ({Object.keys(result.response?.headers || {}).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("assertions")}
            className={`px-3 py-1.5 rounded-t-lg transition-colors ${
              activeTab === "assertions"
                ? "bg-white/[0.08] text-white font-bold border-b-2 border-brand-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Assertions ({result.assertions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("request")}
            className={`px-3 py-1.5 rounded-t-lg transition-colors ${
              activeTab === "request"
                ? "bg-white/[0.08] text-white font-bold border-b-2 border-brand-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sent Request
          </button>
        </div>

        {activeTab === "body" && formattedBody && (
          <button
            type="button"
            onClick={() => handleCopy(formattedBody)}
            className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors pb-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="p-4 min-h-[220px]">
        {/* BODY TAB */}
        {activeTab === "body" && (
          <div>
            {formattedBody ? (
              <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.06] text-xs font-mono text-zinc-200 overflow-x-auto max-h-[380px] leading-relaxed">
                <code>{formattedBody}</code>
              </pre>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                No response body received.
              </div>
            )}
          </div>
        )}

        {/* HEADERS TAB */}
        {activeTab === "headers" && (
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
            {result.response?.headers && Object.keys(result.response.headers).length > 0 ? (
              Object.entries(result.response.headers).map(([key, val]) => (
                <div
                  key={key}
                  className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] flex items-start gap-4 text-xs font-mono"
                >
                  <span className="text-zinc-400 font-bold w-48 shrink-0">{key}:</span>
                  <span className="text-zinc-200 break-all">{val}</span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                No headers available.
              </div>
            )}
          </div>
        )}

        {/* ASSERTIONS TAB */}
        {activeTab === "assertions" && (
          <div className="space-y-2">
            {result.assertions.map((a, idx) => {
              const pass = a.status === "PASSED";
              return (
                <div
                  key={a.assertionId || idx}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs font-mono ${
                    pass
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/25 text-rose-300"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {pass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="uppercase">{a.type.replace(/_/g, " ")}</span>
                        {a.expected && (
                          <span className="text-zinc-400 font-normal">
                            (expected: &quot;{a.expected}&quot;)
                          </span>
                        )}
                      </div>
                      {a.actual && (
                        <div className="text-[11px] text-zinc-400">
                          Actual: &quot;{a.actual}&quot;
                        </div>
                      )}
                      {a.message && !pass && (
                        <div className="text-[11px] text-rose-200">{a.message}</div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/30 shrink-0">
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* SENT REQUEST TAB */}
        {activeTab === "request" && (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase">URL &amp; Method</span>
              <div className="text-white font-bold">
                <span className="text-brand-400">{result.request.method}</span> {result.request.resolvedUrl}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
              <span className="text-zinc-500 text-[10px] uppercase">Headers (Masked)</span>
              <div className="space-y-1">
                {Object.entries(result.request.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-zinc-400 font-bold">{k}:</span>
                    <span className="text-zinc-200 break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {result.request.body && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                <span className="text-zinc-500 text-[10px] uppercase">Request Body</span>
                <pre className="p-2.5 rounded bg-zinc-950 text-zinc-200 overflow-x-auto">
                  {result.request.body}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
