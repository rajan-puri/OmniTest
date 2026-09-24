import React from "react";
import { Code2, Cpu, SearchCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Code2,
      title: "Author & Configure",
      badge: "TypeScript",
      description:
        "Define tests using standard Playwright syntax or low-code visual actions. Specify baseUrl, environments, and secrets in a single omnitest.config.ts file.",
      codeSnippet: `// omnitest.config.ts
export default defineConfig({
  project: 'e-commerce-store',
  browsers: ['chromium', 'webkit'],
  engines: ['playwright', 'axe', 'lighthouse'],
  concurrency: 5,
});`,
    },
    {
      step: "02",
      icon: Cpu,
      title: "Orchestrate & Parallelize",
      badge: "Ephemeral Grid",
      description:
        "Trigger tests via CLI, GitHub PRs, or scheduled crons. OmniTest dispatches jobs through BullMQ to stateless, hardened container pods with zero host state leakage.",
      codeSnippet: `$ omnitest run --smoke --env=staging
[Queue] Enqueued job run_9b1deb4d
[Worker-01] Booting headless Chromium...
[Worker-02] Running axe-core scan...
[Worker-03] Executing Lighthouse audit...`,
    },
    {
      step: "03",
      icon: SearchCheck,
      title: "Inspect & Triage",
      badge: "Full Diagnostics",
      description:
        "When an assertion breaks, debug with interactive Playwright traces, synchronized video playback, network HAR waterfalls, and element DOM snapshots.",
      codeSnippet: `[Artifacts Uploaded to S3]
✓ trace.zip (Interactive DOM snapshot)
✓ execution-recording.webm (Synced video)
✓ axe-violations.json (WCAG 2.1 AA)
Result: PASSED in 1.42s (12/12 green)`,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-white/[0.08] bg-[#090A0F] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono font-medium tracking-wider text-cyan-400 uppercase bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/20">
            How OmniTest Works
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            From local commit to cloud evidence in seconds
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            A developer-first execution cycle engineered for maximum speed, strict isolation, and zero debugging friction.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-5 rounded-lg surface-card border border-white/[0.08] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-mono font-bold text-emerald-400">
                      {item.step}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-emerald-400" />
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="p-3 rounded-md bg-[#0A0C10] border border-white/[0.06] font-mono text-[11px] text-zinc-300 overflow-x-auto">
                  <pre className="text-zinc-400 leading-tight">
                    <code>{item.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
