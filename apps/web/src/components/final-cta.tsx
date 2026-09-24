import React from "react";
import Link from "next/link";
import { ArrowRight, Terminal, CheckCircle2 } from "lucide-react";

export function FinalCta() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0A0C10] border-t border-white/[0.06]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-14 rounded-3xl glass-panel-elevated border border-white/[0.12] text-center shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-mono text-brand-300 mb-6">
            <Terminal className="w-3.5 h-3.5" />
            <span>Ready for unified testing?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Stop juggling five testing tools. <br />
            <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
              One platform. Every test.
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl mx-auto">
            Join hundreds of engineering teams who have eliminated flaky CI runs, fragmented reports, and expensive testing SaaS sprawl.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-base transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 flex items-center justify-center gap-2 group"
            >
              Start Testing Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl glass-panel hover:bg-white/[0.08] text-white font-semibold text-base transition-colors border border-white/[0.1]"
            >
              View Interactive Demo
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              14-day Team Pro trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              2-minute CLI setup
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
