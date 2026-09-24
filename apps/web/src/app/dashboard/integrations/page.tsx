import React from "react";
import Link from "next/link";
import { Boxes, ArrowRight, FolderGit2 } from "lucide-react";

export default function IntegrationsPlaceholderPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-6">
      <div className="pb-6 border-b border-white/[0.08]">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Boxes className="w-6 h-6 text-fuchsia-400" />
          Developer Integrations
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Connect your GitHub repositories, Slack channels, and CI/CD pipelines.
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-2xl glass-panel-elevated border border-white/[0.08] text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mx-auto">
          <Boxes className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">GitHub &amp; CI Integrations (Phase 7)</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
            The native GitHub App for commit checks, automated PR comments, and the `@omnitest/cli` package will be delivered in Phase 7.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs border border-white/[0.08] transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            Back to Projects
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
