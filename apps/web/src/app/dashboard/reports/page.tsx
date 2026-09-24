import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Layers, ArrowRight, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EngineBadge } from "@/components/ui/EngineBadge";

export default async function ReportsDirectoryPage() {
  const user = await getAuthenticatedUser();
  if (!user || !user.activeOrg) return null;

  const orgId = user.activeOrg.id;

  const runs = await db.testRun.findMany({
    where: {
      project: {
        organizationId: orgId,
      },
    },
    include: {
      project: {
        select: { id: true, name: true, slug: true },
      },
      suite: {
        select: { id: true, name: true },
      },
      testResults: {
        select: {
          id: true,
          status: true,
          testType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalReports = runs.length;
  const passedReports = runs.filter((r) => r.status === "PASSED").length;
  const failedReports = runs.filter((r) => r.status === "FAILED").length;
  const overallPassRate = totalReports > 0 ? Math.round((passedReports / totalReports) * 100) : 0;

  // Calculate average duration
  const runsWithDuration = runs.filter((r) => typeof r.durationMs === "number" && r.durationMs > 0);
  const avgDurationMs =
    runsWithDuration.length > 0
      ? Math.round(runsWithDuration.reduce((acc, r) => acc + (r.durationMs || 0), 0) / runsWithDuration.length)
      : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quality & Test Reports"
        description={`Aggregated execution telemetry, pass/fail distribution, and failure diagnostics across ${user.activeOrg.name}.`}
        breadcrumbs={[{ label: user.activeOrg.name }, { label: "Reports" }]}
        actions={
          <Link
            href="/dashboard/runs"
            className="px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium border border-white/[0.08] flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            Execution Grid
          </Link>
        }
      />

      {/* Analytical Telemetry KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Generated Reports" value={totalReports} subtext="Historical runs" />
        <MetricCard
          label="Pass Rate"
          value={`${overallPassRate}%`}
          status={overallPassRate >= 90 ? "success" : overallPassRate >= 70 ? "warning" : "error"}
          subtext={`${passedReports} of ${totalReports} passed`}
        />
        <MetricCard
          label="Failed Runs"
          value={failedReports}
          status={failedReports > 0 ? "error" : "success"}
          subtext={failedReports > 0 ? "Regression alert" : "Clean state"}
        />
        <MetricCard
          label="Avg Duration"
          value={avgDurationMs ? `${(avgDurationMs / 1000).toFixed(2)}s` : "-"}
          subtext="Per executed suite"
        />
      </div>

      {/* Pass/Fail Distribution Bar */}
      {totalReports > 0 && (
        <div className="surface-card p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Pass / Fail Distribution</span>
            <span>
              {passedReports} passed ({overallPassRate}%) • {failedReports} failed ({100 - overallPassRate}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500" style={{ width: `${overallPassRate}%` }} />
            <div className="h-full bg-rose-500" style={{ width: `${100 - overallPassRate}%` }} />
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="data-table-container">
        {runs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 font-mono">
            No test execution reports generated yet. Run tests to produce comprehensive quality reports.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Report ID</th>
                <th>Project</th>
                <th>Suite / Target</th>
                <th>Engine Coverage</th>
                <th>Duration</th>
                <th>Generated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => {
                const durationStr = r.durationMs ? `${(r.durationMs / 1000).toFixed(2)}s` : "-";
                const createdAgo = formatTimeAgo(r.createdAt);

                // Collect distinct test types in this run
                const types = Array.from(new Set(r.testResults.map((res) => res.testType).filter(Boolean)));

                return (
                  <tr key={r.id}>
                    <td>
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/projects/${r.project.id}/runs/${r.id}/report`}
                        className="font-mono text-[11px] text-zinc-300 hover:text-white transition-colors"
                      >
                        {r.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/projects/${r.project.id}`}
                        className="text-zinc-400 hover:text-zinc-200 truncate max-w-[130px] block"
                      >
                        {r.project.name}
                      </Link>
                    </td>
                    <td className="text-zinc-300 truncate max-w-[180px]">
                      {r.suite?.name || "Full Regression Suite"}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {types.length > 0 ? (
                          types.map((t) => <EngineBadge key={t} type={t} size="xs" />)
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="font-mono text-[11px] text-zinc-400">{durationStr}</td>
                    <td className="font-mono text-[11px] text-zinc-400">{createdAgo}</td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`/api/projects/${r.project.id}/runs/${r.id}/report?format=json`}
                          title="Export JSON"
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                        <Link
                          href={`/dashboard/projects/${r.project.id}/runs/${r.id}/report`}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-1 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
        <span>Showing {runs.length} reports</span>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
