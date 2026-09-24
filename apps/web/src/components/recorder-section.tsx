import React from "react";
import { MousePointer, PlaySquare, Code, CheckCircle, Sparkles, Layers } from "lucide-react";

export function RecorderSection() {
  return (
    <section className="py-20 relative bg-[#08090C] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Value proposition */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[11px] font-mono font-medium tracking-wider text-violet-400 uppercase bg-violet-950/40 px-2.5 py-1 rounded border border-violet-500/20">
              Low-Code &amp; High-Control
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              A test recorder that writes real, clean Playwright code
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Don’t let non-technical team members get left out of testing. Click through your app naturally—OmniTest records resilient semantic locators and generates standard TypeScript you can commit to Git.
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Semantic Role Locators</h4>
                  <p className="text-[11px] text-zinc-400">
                    Prioritizes accessible roles (<code className="text-emerald-300">getByRole</code>, <code className="text-emerald-300">getByTestId</code>) over brittle CSS paths.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Bi-Directional Freedom</h4>
                  <p className="text-[11px] text-zinc-400">
                    Edit visually in the UI or directly in code. Zero proprietary runtime lock-in.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-violet-500/10 text-violet-400 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Automatic Wait States</h4>
                  <p className="text-[11px] text-zinc-400">
                    Zero arbitrary <code className="text-violet-300">sleep(5000)</code> hacks. Automatic hydration and network idle stabilization.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Builder Mockup */}
          <div className="lg:col-span-7 rounded-lg surface-card border border-white/[0.08] overflow-hidden">
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
            <div className="p-4 space-y-2 bg-[#090A0F]">
              {/* Step 1 */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[11px] flex items-center justify-center font-bold">
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
              <div className="flex items-center justify-between p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded bg-cyan-500/15 text-cyan-400 font-mono text-[11px] flex items-center justify-center font-bold">
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
              <div className="flex items-center justify-between p-2.5 rounded-md bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded bg-violet-500/15 text-violet-400 font-mono text-[11px] flex items-center justify-center font-bold">
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
              <div className="flex items-center justify-between p-2.5 rounded-md bg-emerald-950/20 border border-emerald-500/25">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px] flex items-center justify-center font-bold">
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
              <span className="text-emerald-400 font-medium cursor-pointer hover:underline">
                Copy spec.ts
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
