"use client";

import React, { useState } from "react";
import {
  Globe,
  Layers,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Sliders,
} from "lucide-react";
import { A11yTestSpec, A11yStandard } from "@/lib/runner/a11y-types";

interface A11yTestConfigProps {
  initialSpec?: Partial<A11yTestSpec>;
  baseUrl?: string;
  onChange: (spec: A11yTestSpec) => void;
}

export function A11yTestConfig({
  initialSpec,
  baseUrl,
  onChange,
}: A11yTestConfigProps) {
  const [url, setUrl] = useState<string>(
    initialSpec?.url || baseUrl || "https://example.com"
  );
  const [scope, setScope] = useState<"page" | "selector">(
    initialSpec?.scope || "page"
  );
  const [selector, setSelector] = useState<string>(initialSpec?.selector || "");
  const [standards, setStandards] = useState<A11yStandard[]>(
    initialSpec?.standards && initialSpec.standards.length > 0
      ? initialSpec.standards
      : ["wcag2a", "wcag2aa"]
  );
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(
    initialSpec?.timeoutSeconds || 30
  );

  const notifyChange = (updated: Partial<A11yTestSpec>) => {
    const full: A11yTestSpec = {
      version: "1.0",
      url: updated.url ?? url,
      scope: updated.scope ?? scope,
      selector: updated.scope === "selector" ? (updated.selector ?? selector) : undefined,
      standards: updated.standards ?? standards,
      timeoutSeconds: updated.timeoutSeconds ?? timeoutSeconds,
    };
    onChange(full);
  };

  const handleToggleStandard = (std: A11yStandard) => {
    let next: A11yStandard[];
    if (standards.includes(std)) {
      if (standards.length === 1) return; // Keep at least one
      next = standards.filter((s) => s !== std);
    } else {
      next = [...standards, std];
    }
    setStandards(next);
    notifyChange({ standards: next });
  };

  return (
    <div className="p-6 rounded-2xl glass-panel-elevated border border-white/[0.08] space-y-6">
      {/* Target URL */}
      <div className="space-y-2">
        <label htmlFor="a11y-url" className="block text-xs font-semibold text-zinc-200">
          Target URL to Audit <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <Globe className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            id="a11y-url"
            type="text"
            required
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              notifyChange({ url: e.target.value });
            }}
            placeholder="https://example.com or /dashboard"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
          />
        </div>
        <p className="text-[11px] font-mono text-zinc-500">
          Playwright will navigate to this page in a sandboxed headless browser and execute axe-core rules.
        </p>
      </div>

      {/* Scope Selector */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-zinc-200">Audit Scope</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
          <label
            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
              scope === "page"
                ? "bg-amber-500/15 border-amber-500/40 text-white"
                : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
            }`}
          >
            <input
              type="radio"
              name="scope"
              checked={scope === "page"}
              onChange={() => {
                setScope("page");
                notifyChange({ scope: "page" });
              }}
              className="text-amber-500 focus:ring-0"
            />
            <div>
              <div className="text-xs font-bold">Entire Page</div>
              <div className="text-[11px] text-zinc-400">Scan complete DOM document</div>
            </div>
          </label>

          <label
            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
              scope === "selector"
                ? "bg-amber-500/15 border-amber-500/40 text-white"
                : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
            }`}
          >
            <input
              type="radio"
              name="scope"
              checked={scope === "selector"}
              onChange={() => {
                setScope("selector");
                notifyChange({ scope: "selector" });
              }}
              className="text-amber-500 focus:ring-0"
            />
            <div>
              <div className="text-xs font-bold">CSS Selector Scope</div>
              <div className="text-[11px] text-zinc-400">Target a container element</div>
            </div>
          </label>
        </div>

        {scope === "selector" && (
          <div className="pt-1">
            <input
              type="text"
              value={selector}
              onChange={(e) => {
                setSelector(e.target.value);
                notifyChange({ selector: e.target.value });
              }}
              placeholder="e.g. #main-content or [role='main']"
              className="w-full max-w-md px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      {/* WCAG Standards Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-200">
          Target WCAG &amp; Best Practice Standards
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={standards.includes("wcag2a")}
              onChange={() => handleToggleStandard("wcag2a")}
              className="rounded bg-zinc-900 border-white/[0.1] text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="text-xs font-bold text-white">WCAG 2.1 Level A</div>
              <div className="text-[10px] text-zinc-400">Essential baseline criteria</div>
            </div>
          </label>

          <label className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={standards.includes("wcag2aa")}
              onChange={() => handleToggleStandard("wcag2aa")}
              className="rounded bg-zinc-900 border-white/[0.1] text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="text-xs font-bold text-white">WCAG 2.1 Level AA</div>
              <div className="text-[10px] text-zinc-400">Standard legal threshold</div>
            </div>
          </label>

          <label className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={standards.includes("best-practice")}
              onChange={() => handleToggleStandard("best-practice")}
              className="rounded bg-zinc-900 border-white/[0.1] text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <div>
              <div className="text-xs font-bold text-white">Best Practices</div>
              <div className="text-[10px] text-zinc-400">Common usability heuristics</div>
            </div>
          </label>
        </div>
      </div>

      {/* Info notice about automated testing limitations */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300/90 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Automated a11y scope:</span> axe-core automated audits detect roughly 30–50% of WCAG issues (contrast, labels, alt-text, roles). Automated scans do not replace manual keyboard navigation, screen reader testing, or cognitive accessibility review.
        </div>
      </div>
    </div>
  );
}
