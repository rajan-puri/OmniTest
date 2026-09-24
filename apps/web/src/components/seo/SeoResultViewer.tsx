"use client";

import React, { useState } from "react";
import { SeoExecutionResult, SeoFinding, SeoCategory } from "@/lib/runner/seo-types";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Globe,
  Camera,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Search,
  Code,
  Share2,
  FileText,
  Smartphone,
  Layers,
  ArrowRight,
} from "lucide-react";

interface SeoResultViewerProps {
  result: SeoExecutionResult;
}

export function SeoResultViewer({ result }: SeoResultViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [activeFinding, setActiveFinding] = useState<SeoFinding | null>(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All Categories", icon: <Layers className="h-3.5 w-3.5" /> },
    { id: "technical", label: "Technical", icon: <Globe className="h-3.5 w-3.5" /> },
    { id: "metadata", label: "Metadata", icon: <FileText className="h-3.5 w-3.5" /> },
    { id: "indexability", label: "Indexability", icon: <Search className="h-3.5 w-3.5" /> },
    { id: "headings", label: "Headings", icon: <Code className="h-3.5 w-3.5" /> },
    { id: "images", label: "Images", icon: <Camera className="h-3.5 w-3.5" /> },
    { id: "links", label: "Links", icon: <ExternalLink className="h-3.5 w-3.5" /> },
    { id: "social", label: "Social", icon: <Share2 className="h-3.5 w-3.5" /> },
    { id: "structured_data", label: "Structured Data", icon: <Code className="h-3.5 w-3.5" /> },
    { id: "mobile", label: "Mobile", icon: <Smartphone className="h-3.5 w-3.5" /> },
  ];

  const filteredFindings = result.findings.filter((f) => {
    if (selectedCategory !== "all" && f.category !== selectedCategory) return false;
    if (selectedSeverity !== "all" && f.severity !== selectedSeverity) return false;
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "ERROR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="h-3 w-3" /> Error
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3 w-3" /> Warning
          </span>
        );
      case "INFO":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Info className="h-3 w-3" /> Info
          </span>
        );
      case "PASS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Pass
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Status Banner */}
      <div
        className={`p-5 rounded-lg border ${
          result.status === "PASSED"
            ? "bg-emerald-950/20 border-emerald-800/40"
            : "bg-rose-950/20 border-rose-800/40"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {result.status === "PASSED" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-400" />
              )}
              <h2 className="text-base font-semibold text-slate-100">
                SEO Audit {result.status === "PASSED" ? "Passed" : "Assertions Breached"}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                HTTP {result.httpStatus} {result.httpStatusText}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <Globe className="h-3.5 w-3.5 text-slate-400" /> {result.finalUrl}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {result.durationMs}ms
              </span>
            </div>
          </div>

          {result.screenshotUrl && (
            <button
              onClick={() => setShowScreenshotModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md border border-slate-700 transition-colors"
            >
              <Camera className="h-3.5 w-3.5 text-emerald-400" />
              Inspect Page Screenshot
            </button>
          )}
        </div>

        {/* Redirect Chain Notification */}
        {result.redirectChain && result.redirectChain.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-300">
            <span className="font-medium text-amber-400">Redirect Chain:</span>
            {result.redirectChain.map((step, idx) => (
              <span key={idx} className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                <span className="text-amber-300 font-semibold">{step.status}</span> {step.url}
                <ArrowRight className="h-3 w-3 text-slate-500" />
              </span>
            ))}
            <span className="font-mono text-[11px] text-emerald-300 font-semibold">{result.httpStatus} (Final)</span>
          </div>
        )}
      </div>

      {/* 2. Audit Findings Scoreboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedSeverity(selectedSeverity === "ERROR" ? "all" : "ERROR")}
          className={`p-4 rounded-lg border text-left transition-all ${
            selectedSeverity === "ERROR"
              ? "bg-rose-950/40 border-rose-600 ring-1 ring-rose-500"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-slate-400 font-medium">Errors</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{result.summary.errors}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Critical anomalies</div>
        </button>

        <button
          onClick={() => setSelectedSeverity(selectedSeverity === "WARNING" ? "all" : "WARNING")}
          className={`p-4 rounded-lg border text-left transition-all ${
            selectedSeverity === "WARNING"
              ? "bg-amber-950/40 border-amber-600 ring-1 ring-amber-500"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-slate-400 font-medium">Warnings</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{result.summary.warnings}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Heuristic notices</div>
        </button>

        <button
          onClick={() => setSelectedSeverity(selectedSeverity === "INFO" ? "all" : "INFO")}
          className={`p-4 rounded-lg border text-left transition-all ${
            selectedSeverity === "INFO"
              ? "bg-sky-950/40 border-sky-600 ring-1 ring-sky-500"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-slate-400 font-medium">Information</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">{result.summary.info}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Detected signals</div>
        </button>

        <button
          onClick={() => setSelectedSeverity(selectedSeverity === "PASS" ? "all" : "PASS")}
          className={`p-4 rounded-lg border text-left transition-all ${
            selectedSeverity === "PASS"
              ? "bg-emerald-950/40 border-emerald-600 ring-1 ring-emerald-500"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs text-slate-400 font-medium">Passed Checks</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{result.summary.passed}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Standards compliant</div>
        </button>
      </div>

      {/* 3. Deterministic Assertions Result Section */}
      {result.assertions && result.assertions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Deterministic Assertions Evaluation
          </h3>
          <div className="space-y-2">
            {result.assertions.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-md text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {a.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-medium text-slate-200 block">{a.description}</span>
                    <span className="text-[11px] text-slate-400">
                      Actual: <span className="font-mono text-slate-300">{a.actual}</span> • Expected:{" "}
                      <span className="font-mono text-slate-400">{a.expected}</span>
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    a.passed
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {a.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedCategory === c.id
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {c.icon}
            {c.label}
          </button>
        ))}
      </div>

      {/* 5. Findings Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Audit Findings ({filteredFindings.length})
          </h3>
          {(selectedCategory !== "all" || selectedSeverity !== "all") && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSeverity("all");
              }}
              className="text-xs text-emerald-400 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        {filteredFindings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No findings match the current filter selection.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                onClick={() => setActiveFinding(activeFinding?.id === finding.id ? null : finding)}
                className="p-4 hover:bg-slate-800/30 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(finding.severity)}
                      <span className="text-xs font-semibold text-slate-200">{finding.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {finding.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{finding.description}</p>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {activeFinding?.id === finding.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Expanded Inspection Drawer */}
                {activeFinding?.id === finding.id && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-950 rounded border border-slate-850">
                        <span className="text-[11px] font-medium text-slate-400 block mb-1">
                          Actual Observed Value:
                        </span>
                        <div className="font-mono text-slate-200 break-all">{finding.actual}</div>
                      </div>
                      {finding.expected && (
                        <div className="p-3 bg-slate-950 rounded border border-slate-850">
                          <span className="text-[11px] font-medium text-slate-400 block mb-1">
                            Expected / Standard:
                          </span>
                          <div className="font-mono text-slate-200 break-all">{finding.expected}</div>
                        </div>
                      )}
                    </div>

                    {finding.evidence && (
                      <div className="p-3 bg-slate-950 rounded border border-slate-850">
                        <span className="text-[11px] font-medium text-slate-400 block mb-1">
                          Extracted Evidence:
                        </span>
                        <pre className="font-mono text-[11px] text-emerald-400 whitespace-pre-wrap break-all overflow-x-auto">
                          {finding.evidence}
                        </pre>
                      </div>
                    )}

                    {finding.recommendation && (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded text-emerald-300">
                        <span className="font-semibold block mb-0.5">Recommendation:</span>
                        {finding.recommendation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Page Details Overview Panels */}
      {result.pageDetails && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Headings */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-emerald-400" /> Heading Structure
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-xs">
              <div className="p-2 bg-slate-950 rounded">
                <span className="text-slate-400 block text-[10px]">H1</span>
                <span className="font-bold text-slate-200">{result.pageDetails.headings.h1Count}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded">
                <span className="text-slate-400 block text-[10px]">H2</span>
                <span className="font-bold text-slate-200">{result.pageDetails.headings.h2Count}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded">
                <span className="text-slate-400 block text-[10px]">H3</span>
                <span className="font-bold text-slate-200">{result.pageDetails.headings.h3Count}</span>
              </div>
            </div>
            {result.pageDetails.headings.h1Texts.length > 0 && (
              <div className="text-[11px] text-slate-400 pt-1 truncate">
                <span className="text-slate-500">Main:</span> &quot;{result.pageDetails.headings.h1Texts[0]}&quot;
              </div>
            )}
          </div>

          {/* Images */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-emerald-400" /> Image Alt Attributes
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-xs">
              <div className="p-2 bg-slate-950 rounded">
                <span className="text-slate-400 block text-[10px]">Total</span>
                <span className="font-bold text-slate-200">{result.pageDetails.images.total}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded">
                <span className="text-slate-400 block text-[10px]">With Alt</span>
                <span className="font-bold text-emerald-400">{result.pageDetails.images.withAlt}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded">
                <span className="text-slate-400 block text-[10px]">Missing</span>
                <span
                  className={`font-bold ${
                    result.pageDetails.images.missingAlt > 0 ? "text-rose-400" : "text-slate-200"
                  }`}
                >
                  {result.pageDetails.images.missingAlt}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Decorative graphics identified: {result.pageDetails.images.decorative}
            </div>
          </div>

          {/* Structured Data & Social */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-emerald-400" /> Structured & Social
            </h4>
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between items-center text-slate-400">
                <span>JSON-LD Schema:</span>
                <span className="text-slate-200 font-mono">
                  {result.pageDetails.structuredData.jsonLdDetected ? "Detected" : "None"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Open Graph:</span>
                <span className="text-slate-200 font-mono">
                  {result.pageDetails.openGraph.title ? "Configured" : "Missing"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Robots.txt:</span>
                <span className="text-slate-200 font-mono">
                  {result.pageDetails.robotsTxt.fetched ? "Available" : "Not Found"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Screenshot Modal */}
      {showScreenshotModal && result.screenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-200">Page Screenshot Evidence</h3>
              </div>
              <button
                onClick={() => setShowScreenshotModal(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>
            <div className="overflow-auto p-4 flex items-center justify-center bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.screenshotUrl}
                alt="SEO scan page capture"
                className="max-w-full h-auto rounded border border-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. Technical Disclaimer */}
      <div className="flex items-center gap-2 p-3 bg-slate-900/50 border border-slate-800 rounded text-slate-400 text-xs">
        <Info className="h-4 w-4 text-slate-500 shrink-0" />
        <span>
          OmniTest SEO Testing inspects document structure, crawlability signals, and technical web standards. It does not measure search-engine rankings, crawl frequency, or indexation guarantees.
        </span>
      </div>
    </div>
  );
}
