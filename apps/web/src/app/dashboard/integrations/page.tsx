import React from "react";
import Link from "next/link";
import { Boxes, ArrowRight, FolderGit2, Check, Clock, ExternalLink } from "lucide-react";

export default function IntegrationsPlaceholderPage() {
  const integrations = [
    {
      id: "cli",
      name: "OmniTest CLI",
      category: "Developer Tooling",
      status: "Available",
      statusColor: "text-emerald-400",
      description: "Local test running, history querying, and configuration initialization via @omnitest/cli.",
      actionLabel: "View Docs",
      href: "/dashboard",
    },
    {
      id: "github",
      name: "GitHub Actions & App",
      category: "CI/CD & Source Control",
      status: "Phase 7 Roadmap",
      statusColor: "text-amber-400",
      description: "Automated PR check runs, commit status updates, and rich test summaries directly in pull requests.",
      actionLabel: "Roadmap",
      href: "/dashboard/projects",
    },
    {
      id: "webhooks",
      name: "Outbound Webhooks",
      category: "Notifications & Automation",
      status: "Phase 7 Roadmap",
      statusColor: "text-zinc-500",
      description: "Send JSON event payloads to custom endpoints on test suite completion, regression alert, or failure.",
      actionLabel: "Configure",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Boxes className="w-5 h-5 text-zinc-400" />
          Developer Integrations
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Connect your GitHub repositories, CI/CD runners, and notification pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="surface-card rounded-lg border border-white/[0.08] p-4 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  {item.category}
                </span>
                <span className={`text-[10px] font-mono font-medium flex items-center gap-1 ${item.statusColor}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {item.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white font-mono">{item.name}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <Link
                href={item.href}
                className="inline-flex items-center gap-1 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
