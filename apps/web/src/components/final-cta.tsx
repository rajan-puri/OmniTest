import React from "react";
import Link from "next/link";
import { ArrowRight, Terminal, CheckCircle2 } from "lucide-react";

export function FinalCta() {
  return (
    <section className="py-20 relative bg-[#090A0F] border-t border-white/[0.08]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-12 rounded-lg surface-card border border-white/[0.08] text-center">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400 mb-5">
            <Terminal className="w-3.5 h-3.5" />
            <span>Ready for unified testing?</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Stop juggling five testing tools. <br />
            <span className="text-emerald-400">
              One platform. Every test.
            </span>
          </h2>

          <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto">
            Join hundreds of engineering teams who have eliminated flaky CI runs, fragmented reports, and expensive testing SaaS sprawl.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Start Testing Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-6 py-2.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs transition-colors border border-white/[0.08]"
            >
              View Interactive Demo
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              14-day Team Pro trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              2-minute CLI setup
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
