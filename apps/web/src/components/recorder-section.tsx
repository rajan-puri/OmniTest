import React from "react";
import { MousePointer, PlaySquare, Code, CheckCircle, Sparkles, Layers } from "lucide-react";

export function RecorderSection() {
  return (
    <section className="py-24 relative bg-[#08090C] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value proposition */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono font-bold tracking-wider text-violet-400 uppercase bg-violet-950/40 px-3 py-1 rounded-full border border-violet-500/20">
              Low-Code &amp; High-Control
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A test recorder that writes real, clean Playwright code.
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed">
              Don’t let non-technical team members get left out of testing. Click through your app naturally—OmniTest records resilient semantic locators and generates standard TypeScript you can commit to Git.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-md bg-brand-500/10 text-brand-400 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Semantic Role Locators</h4>
                  <p className="text-xs text-zinc-400">
                    Prioritizes accessible roles (<code className="text-brand-300">getByRole</code>, <code className="text-brand-300">getByTestId</code>) over brittle CSS paths.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Bi-Directional Freedom</h4>
                  <p className="text-xs text-zinc-400">
                    Edit visually in the UI or directly in code. Zero proprietary runtime lock-in.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-md bg-violet-500/10 text-violet-400 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Automatic Wait States</h4>
                  <p className="text-xs text-zinc-400">
                    Zero arbitrary <code className="text-violet-300">sleep(5000)</code> hacks. Automatic hydration and network idle stabilization.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Builder Mockup */}
          <div className="lg:col-span-7 rounded-2xl glass-panel-elevated border border-white/[0.1] overflow-hidden shadow-2xl">
            {/* Visual Builder Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0D0F14] border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <PlaySquare className="w-4 h-4 text-violet-400" />
                <span className="font-mono text-xs font-semibold text-zinc-300">
                  Visual Test Authoring Studio
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                Target: https://staging.store.dev
              </span>
            </div>

            {/* Visual Steps List */}
            <div className="p-5 space-y-2.5 bg-[#0A0C10]">
              {/* Step 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-brand-500/20 text-brand-400 font-mono text-[11px] flex items-center justify-center font-bold">
                    1
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white">Navigate</span>
                    <span className="text-xs font-mono text-zinc-400 ml-2">/checkout</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">200 OK • 180ms</span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-mono text-[11px] flex items-center justify-center font-bold">
                    2
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white">Fill Field</span>
                    <span className="text-xs font-mono text-cyan-300 ml-2">
                      getByRole(&apos;textbox&apos;, &#123; name: &apos;Email Address&apos; &#125;)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                  &quot;alex@omnitest.dev&quot;
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-violet-500/20 text-violet-400 font-mono text-[11px] flex items-center justify-center font-bold">
                    3
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white">Click</span>
                    <span className="text-xs font-mono text-violet-300 ml-2">
                      getByRole(&apos;button&apos;, &#123; name: &apos;Complete Order&apos; &#125;)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Triggered</span>
              </div>

              {/* Step 4: Assertion */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[11px] flex items-center justify-center font-bold">
                    4
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-emerald-300">Assert Visibility</span>
                    <span className="text-xs font-mono text-emerald-200 ml-2">
                      getByTestId(&apos;order-confirmation-badge&apos;)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">PASSED</span>
              </div>
            </div>

            {/* Generated Code Preview Strip */}
            <div className="p-3 bg-[#0D0F14] border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-zinc-500" />
                Generated Playwright Spec ready to export
              </span>
              <span className="text-brand-400 font-semibold cursor-pointer hover:underline">
                Copy spec.ts
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
