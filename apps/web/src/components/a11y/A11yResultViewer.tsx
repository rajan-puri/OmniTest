"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  Code2,
  Camera,
} from "lucide-react";
import {
  A11yExecutionResult,
  A11yRuleResult,
  A11yImpact,
} from "@/lib/runner/a11y-types";

interface A11yResultViewerProps {
  result: A11yExecutionResult;
}

export function A11yResultViewer({ result }: A11yResultViewerProps) {
  const [activeTab, setActiveTab] = useState<"violations" | "passes" | "incomplete">("violations");
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedRules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getImpactBadge = (impact?: A11yImpact) => {
    switch (impact) {
      case "critical":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Critical
          </span>
        );
      case "serious":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30">
            Serious
          </span>
        );
      case "moderate":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Moderate
          </span>
        );
      case "minor":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Minor
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-zinc-800 text-zinc-400">
            Unknown
          </span>
        );
    }
  };

  const isPassed = result.status === "PASSED";

  return (
    <div className="rounded-2xl glass-panel-elevated border border-white/[0.08] overflow-hidden space-y-0">
      {/* Top Header & Tally Cards */}
      <div className="p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black/80 border-b border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {isPassed ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Automated Accessibility Audit
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    isPassed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {result.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate max-w-xl">
                Target: {result.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{result.durationMs}ms</span>
          </div>
        </div>

        {/* Severity Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
            <span className="text-[10px] font-mono font-bold uppercase text-rose-400 block">
              Critical
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {result.summary.critical}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
            <span className="text-[10px] font-mono font-bold uppercase text-orange-400 block">
              Serious
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {result.summary.serious}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
              Moderate
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {result.summary.moderate}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
            <span className="text-[10px] font-mono font-bold uppercase text-blue-400 block">
              Minor
            </span>
            <span className="text-xl font-bold font-mono text-white">
              {result.summary.minor}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] px-5 text-xs font-mono pt-2 bg-black/40">
        <button
          type="button"
          onClick={() => setActiveTab("violations")}
          className={`px-3.5 py-2 rounded-t-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "violations"
              ? "bg-white/[0.08] text-white font-bold border-b-2 border-rose-400"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Violations ({result.violations.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("passes")}
          className={`px-3.5 py-2 rounded-t-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "passes"
              ? "bg-white/[0.08] text-white font-bold border-b-2 border-emerald-400"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Passes ({result.passes.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("incomplete")}
          className={`px-3.5 py-2 rounded-t-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "incomplete"
              ? "bg-white/[0.08] text-white font-bold border-b-2 border-amber-400"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Manual Review ({result.incomplete.length})
        </button>
      </div>

      {/* Main Tab Body */}
      <div className="p-5 space-y-4">
        {/* TAB 1: VIOLATIONS */}
        {activeTab === "violations" && (
          <div className="space-y-3">
            {result.violations.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
                <p className="font-bold">No automated accessibility violations detected!</p>
                <p className="text-[11px] text-zinc-400">
                  All automated axe-core rules satisfied for configured WCAG levels.
                </p>
              </div>
            ) : (
              result.violations.map((rule) => {
                const isExpanded = !!expandedRules[rule.id];
                return (
                  <div
                    key={rule.id}
                    className="rounded-xl border border-white/[0.08] bg-black/40 overflow-hidden text-xs font-mono transition-colors"
                  >
                    <div
                      onClick={() => toggleExpand(rule.id)}
                      className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getImpactBadge(rule.impact)}
                          <span className="font-bold text-white text-sm">{rule.help}</span>
                          <span className="text-zinc-500 text-[11px]">({rule.id})</span>
                        </div>
                        <p className="text-zinc-400 font-sans text-xs">{rule.description}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 text-[11px]">
                          {rule.nodes.length} node{rule.nodes.length === 1 ? "" : "s"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-zinc-950/70 border-t border-white/[0.06] space-y-4">
                        {/* Help URL & Tags */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex flex-wrap gap-1.5">
                            {rule.tags.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          {rule.helpUrl && (
                            <a
                              href={rule.helpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-400 hover:underline flex items-center gap-1"
                            >
                              Remediation Advice <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Affected Nodes & Target Selectors */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                            Affected DOM Nodes:
                          </span>
                          {rule.nodes.map((node, nIdx) => (
                            <div
                              key={nIdx}
                              className="p-3 rounded-lg bg-black/60 border border-white/[0.06] space-y-2 text-xs"
                            >
                              <div className="space-y-1">
                                <span className="text-zinc-500 text-[10px] uppercase block">
                                  Selector Target
                                </span>
                                <code className="text-amber-300 bg-white/[0.04] px-1.5 py-0.5 rounded break-all block">
                                  {node.target.join(" > ")}
                                </code>
                              </div>

                              {node.html && (
                                <div className="space-y-1">
                                  <span className="text-zinc-500 text-[10px] uppercase block">
                                    HTML Snippet
                                  </span>
                                  {/* Escaped safely as plain text to prevent XSS */}
                                  <pre className="p-2 rounded bg-zinc-900/80 text-zinc-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                                    <code>{node.html}</code>
                                  </pre>
                                </div>
                              )}

                              {node.failureSummary && (
                                <div className="text-[11px] text-rose-300/90 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                                  {node.failureSummary}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: PASSES */}
        {activeTab === "passes" && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-mono pb-2">
              Rules that evaluated successfully against the DOM:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {result.passes.map((pass) => (
                <div
                  key={pass.id}
                  className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-white truncate">{pass.help}</span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">{pass.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INCOMPLETE / MANUAL REVIEW */}
        {activeTab === "incomplete" && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300">
              <span className="font-bold">Manual review needed:</span> axe-core identified elements that may have accessibility issues which cannot be determined automatically without human evaluation (e.g. contextual color contrast on complex backgrounds).
            </div>

            {result.incomplete.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 font-mono">
                No checks flagged for manual review.
              </div>
            ) : (
              result.incomplete.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl bg-black/40 border border-amber-500/20 space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>{inc.help}</span>
                      <span className="text-zinc-500 text-[11px]">({inc.id})</span>
                    </div>
                    {inc.helpUrl && (
                      <a
                        href={inc.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        Guidance <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-zinc-400 text-xs font-sans">{inc.description}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
