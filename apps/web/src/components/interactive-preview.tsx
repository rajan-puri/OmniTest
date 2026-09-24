"use client";

import React, { useState } from "react";
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Video,
  FileCode,
  Gauge,
  ShieldCheck,
  RefreshCw,
  Clock,
  Terminal as TerminalIcon,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

type EngineTab = "ui" | "api" | "a11y" | "perf";

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<EngineTab>("ui");
  const [isRunning, setIsRunning] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const handleSimulateRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setRunKey((k) => k + 1);
    }, 700);
  };

  return (
    <div className="w-full rounded-lg surface-card overflow-hidden border border-white/[0.08] shadow-2xl">
      {/* Window Title Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0E1017] border-b border-white/[0.08] gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <span className="font-mono text-xs text-zinc-400 font-medium hidden sm:inline">
            omnitest.config.ts — runner-grid-us-east-1
          </span>
        </div>

        {/* Engine switcher tabs */}
        <div className="flex items-center rounded-md bg-black/40 p-0.5 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("ui")}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "ui"
                ? "bg-white/[0.08] text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Video className="w-3 h-3 text-zinc-400" />
            UI (Playwright)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("api")}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "api"
                ? "bg-white/[0.08] text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileCode className="w-3 h-3 text-zinc-400" />
            API Assertions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("a11y")}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "a11y"
                ? "bg-white/[0.08] text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-zinc-400" />
            Accessibility (axe)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("perf")}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "perf"
                ? "bg-white/[0.08] text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Gauge className="w-3 h-3 text-zinc-400" />
            Lighthouse
          </button>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={handleSimulateRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500 text-zinc-950 font-mono text-xs font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              Re-run Suite
            </>
          )}
        </button>
      </div>

      {/* Main Preview Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] bg-[#0A0C10]">
        {/* Left: Code Spec */}
        <div className="lg:col-span-7 p-4 font-mono text-xs text-zinc-300 border-b lg:border-b-0 lg:border-r border-white/[0.08] overflow-x-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.06] text-zinc-500">
            <span className="flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5" />
              spec / tests / {activeTab}-suite.spec.ts
            </span>
            <span className="text-[11px] text-zinc-500">TypeScript</span>
          </div>

          {activeTab === "ui" && (
            <pre className="space-y-1 leading-relaxed">
              <span className="code-token-keyword">import</span> &#123; test, expect &#125; <span className="code-token-keyword">from</span> <span className="code-token-string">&apos;@omnitest/playwright&apos;</span>;
              <br /><br />
              <span className="code-token-function">test</span>(<span className="code-token-string">&apos;User can add product to cart and checkout&apos;</span>, <span className="code-token-keyword">async</span> (&#123; page, omni &#125;) =&gt; &#123;
              <br />
              {"  "}<span className="code-token-comment">{"// 1. Navigate to target preview deployment"}</span><br />
              {"  "}<span className="code-token-keyword">await</span> page.<span className="code-token-function">goto</span>(<span className="code-token-string">&apos;https://preview-pr-42.store.dev/catalog&apos;</span>);
              <br />
              {"  "}<span className="code-token-keyword">await</span> expect(page.<span className="code-token-function">getByRole</span>(<span className="code-token-string">&apos;heading&apos;</span>, &#123; name: <span className="code-token-string">&apos;Products&apos;</span> &#125;)).<span className="code-token-function">toBeVisible</span>();
              <br /><br />
              {"  "}<span className="code-token-comment">{"// 2. Add product & record state trace"}</span><br />
              {"  "}<span className="code-token-keyword">await</span> page.<span className="code-token-function">getByTestId</span>(<span className="code-token-string">&apos;item-headphones&apos;</span>).<span className="code-token-function">click</span>();
              <br />
              {"  "}<span className="code-token-keyword">await</span> page.<span className="code-token-function">getByRole</span>(<span className="code-token-string">&apos;button&apos;</span>, &#123; name: <span className="code-token-string">&apos;Add to Cart&apos;</span> &#125;).<span className="code-token-function">click</span>();
              <br /><br />
              {"  "}<span className="code-token-comment">{"// 3. Assert cart badge updates to 1"}</span><br />
              {"  "}<span className="code-token-keyword">await</span> expect(page.<span className="code-token-function">locator</span>(<span className="code-token-string">&apos;.cart-badge&apos;</span>)).<span className="code-token-function">toHaveText</span>(<span className="code-token-string">&apos;1&apos;</span>);
              <br />
              &#125;);
            </pre>
          )}

          {activeTab === "api" && (
            <pre className="space-y-1 leading-relaxed">
              <span className="code-token-keyword">import</span> &#123; test, expect &#125; <span className="code-token-keyword">from</span> <span className="code-token-string">&apos;@omnitest/api&apos;</span>;
              <br /><br />
              <span className="code-token-function">test</span>(<span className="code-token-string">&apos;POST /api/v1/orders creates order with SLA &lt; 300ms&apos;</span>, <span className="code-token-keyword">async</span> (&#123; api &#125;) =&gt; &#123;
              <br />
              {"  "}<span className="code-token-keyword">const</span> response = <span className="code-token-keyword">await</span> api.<span className="code-token-function">post</span>(<span className="code-token-string">&apos;/api/v1/orders&apos;</span>, &#123;
              <br />
              {"    "}headers: &#123; Authorization: <span className="code-token-string">&apos;Bearer $&#123;env.API_KEY&#125;&apos;</span> &#125;,
              <br />
              {"    "}data: &#123; itemId: <span className="code-token-string">&apos;prod_09a&apos;</span>, quantity: 1, currency: <span className="code-token-string">&apos;USD&apos;</span> &#125;
              <br />
              {"  "}&#125;);
              <br /><br />
              {"  "}<span className="code-token-comment">{"// Assert status code & payload contract"}</span><br />
              {"  "}expect(response.<span className="code-token-variable">status</span>).<span className="code-token-function">toBe</span>(201);
              <br />
              {"  "}expect(response.<span className="code-token-variable">durationMs</span>).<span className="code-token-function">toBeLessThan</span>(300);
              <br />
              {"  "}expect(response.<span className="code-token-variable">data</span>).<span className="code-token-function">toMatchSchema</span>(OrderCreatedSchema);
              <br />
              &#125;);
            </pre>
          )}

          {activeTab === "a11y" && (
            <pre className="space-y-1 leading-relaxed">
              <span className="code-token-keyword">import</span> &#123; test, expect &#125; <span className="code-token-keyword">from</span> <span className="code-token-string">&apos;@omnitest/a11y&apos;</span>;
              <br /><br />
              <span className="code-token-function">test</span>(<span className="code-token-string">&apos;Verify WCAG 2.1 AA Compliance on Checkout page&apos;</span>, <span className="code-token-keyword">async</span> (&#123; page, axe &#125;) =&gt; &#123;
              <br />
              {"  "}<span className="code-token-keyword">await</span> page.<span className="code-token-function">goto</span>(<span className="code-token-string">&apos;https://preview-pr-42.store.dev/checkout&apos;</span>);
              <br />
              {"  "}<span className="code-token-keyword">const</span> scan = <span className="code-token-keyword">await</span> axe.<span className="code-token-function">scan</span>(page, &#123;
              <br />
              {"    "}tags: [<span className="code-token-string">&apos;wcag2a&apos;</span>, <span className="code-token-string">&apos;wcag2aa&apos;</span>, <span className="code-token-string">&apos;best-practice&apos;</span>]
              <br />
              {"  "}&#125;);
              <br /><br />
              {"  "}<span className="code-token-comment">{"// Zero critical/serious violations allowed in PR gate"}</span><br />
              {"  "}expect(scan.<span className="code-token-variable">criticalViolations</span>).<span className="code-token-function">toHaveLength</span>(0);
              <br />
              {"  "}expect(scan.<span className="code-token-variable">seriousViolations</span>).<span className="code-token-function">toHaveLength</span>(0);
              <br />
              &#125;);
            </pre>
          )}

          {activeTab === "perf" && (
            <pre className="space-y-1 leading-relaxed">
              <span className="code-token-keyword">import</span> &#123; test, expect &#125; <span className="code-token-keyword">from</span> <span className="code-token-string">&apos;@omnitest/lighthouse&apos;</span>;
              <br /><br />
              <span className="code-token-function">test</span>(<span className="code-token-string">&apos;Enforce Core Web Vitals budget on Storefront&apos;</span>, <span className="code-token-keyword">async</span> (&#123; audit &#125;) =&gt; &#123;
              <br />
              {"  "}<span className="code-token-keyword">const</span> metrics = <span className="code-token-keyword">await</span> audit.<span className="code-token-function">run</span>(<span className="code-token-string">&apos;https://preview-pr-42.store.dev&apos;</span>, &#123;
              <br />
              {"    "}throttling: <span className="code-token-string">&apos;simulated-mobile-4G&apos;</span>,
              <br />
              {"    "}device: <span className="code-token-string">&apos;mobile&apos;</span>
              <br />
              {"  "}&#125;);
              <br /><br />
              {"  "}expect(metrics.<span className="code-token-variable">performanceScore</span>).<span className="code-token-function">toBeGreaterThanOrEqual</span>(95);
              <br />
              {"  "}expect(metrics.<span className="code-token-variable">lcp</span>).<span className="code-token-function">toBeLessThan</span>(2500); <span className="code-token-comment">{"// < 2.5s"}</span><br />
              {"  "}expect(metrics.<span className="code-token-variable">cls</span>).<span className="code-token-function">toBeLessThan</span>(0.1);  <span className="code-token-comment">{"// < 0.1"}</span><br />
              &#125;);
            </pre>
          )}
        </div>

        {/* Right: Live Execution Diagnostics / Artifact Visualizer */}
        <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-[#0E1015]/60">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.06]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Grid — Worker #04
              </span>
              <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                1.42s
              </span>
            </div>

            {/* Run summary badge */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 mb-3 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-300">
                  {activeTab === "ui" && "UI Workflow Passed (3/3 steps verified)"}
                  {activeTab === "api" && "API Contract Validated (HTTP 201 Created)"}
                  {activeTab === "a11y" && "WCAG 2.1 AA Passed (0 critical violations)"}
                  {activeTab === "perf" && "Core Web Vitals Passed (Performance 98/100)"}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Executed in ephemeral Chromium sandbox via BullMQ worker.
                </p>
              </div>
            </div>

            {/* Step-by-step Execution Log */}
            <div className="space-y-1.5 font-mono text-[11px]">
              {activeTab === "ui" && (
                <>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">✓ goto(/catalog)</span>
                    <span className="text-zinc-500">240ms</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">✓ click([data-testid=&apos;item-headphones&apos;])</span>
                    <span className="text-zinc-500">110ms</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">✓ expect(.cart-badge).toHaveText(&apos;1&apos;)</span>
                    <span className="text-zinc-500">45ms</span>
                  </div>
                </>
              )}

              {activeTab === "api" && (
                <>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">POST /api/v1/orders</span>
                    <span className="text-emerald-400">201 OK</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">Response Latency (SLA)</span>
                    <span className="text-cyan-400">142ms</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">Zod Contract Validation</span>
                    <span className="text-emerald-400">Match 100%</span>
                  </div>
                </>
              )}

              {activeTab === "a11y" && (
                <>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">Critical Violations</span>
                    <span className="text-emerald-400 font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">Color Contrast (4.5:1)</span>
                    <span className="text-emerald-400">Pass</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">Aria Form Labels &amp; Roles</span>
                    <span className="text-emerald-400">Pass</span>
                  </div>
                </>
              )}

              {activeTab === "perf" && (
                <>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">Largest Contentful Paint (LCP)</span>
                    <span className="text-emerald-400 font-bold">1.1s</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">Cumulative Layout Shift (CLS)</span>
                    <span className="text-emerald-400 font-bold">0.002</span>
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-white/[0.03] border border-white/[0.04]">
                    <span className="text-zinc-300">Interaction to Next Paint (INP)</span>
                    <span className="text-emerald-400 font-bold">42ms</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Captured Artifacts footer */}
          <div className="pt-3 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-zinc-500" />
              trace.zip &amp; video.webm captured
            </span>
            <span className="text-brand-400 hover:text-brand-300 flex items-center gap-0.5 cursor-pointer">
              Inspect Trace <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
