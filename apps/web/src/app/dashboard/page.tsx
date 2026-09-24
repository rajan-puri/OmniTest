import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  FolderGit2,
  Plus,
  PlayCircle,
  FileCode2,
  ArrowRight,
  GitBranch,
  ExternalLink,
  Activity,
  Layers,
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EngineBadge } from "@/components/ui/EngineBadge";

export default async function DashboardOverviewPage() {
  const user = await getAuthenticatedUser();
  if (!user || !user.activeOrg) return null;

  const orgId = user.activeOrg.id;

  // Telemetry Aggregations
  const [totalProjects, totalSuites, totalTests, totalRuns, passedRuns, failedRuns] = await Promise.all([
    db.project.count({ where: { organizationId: orgId } }),
    db.testSuite.count({ where: { project: { organizationId: orgId } } }),
    db.test.count({ where: { suite: { project: { organizationId: orgId } } } }),
    db.testRun.count({ where: { project: { organizationId: orgId } } }),
    db.testRun.count({ where: { project: { organizationId: orgId }, status: "PASSED" } }),
    db.testRun.count({ where: { project: { organizationId: orgId }, status: "FAILED" } }),
  ]);

  const passRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 0;

  // Recent Executions
  const recentRuns = await db.testRun.findMany({
    where: { project: { organizationId: orgId } },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      suite: { select: { id: true, name: true } },
      testResults: {
        take: 1,
        select: {
          id: true,
          testId: true,
          testTitle: true,
          testType: true,
          status: true,
          durationMs: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Projects
  const projects = await db.project.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: {
          testSuites: true,
          testRuns: true,
        },
      },
      testRuns: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          durationMs: true,
          createdAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });

  // Engine Test Counts
  const testCountsByType = await db.test.groupBy({
    by: ["type"],
    where: { suite: { project: { organizationId: orgId } } },
    _count: { id: true },
  });

  const engineMap: Record<string, number> = {
    UI: 0,
    API: 0,
    ACCESSIBILITY: 0,
    PERFORMANCE: 0,
    SEO: 0,
  };
  testCountsByType.forEach((t) => {
    engineMap[t.type] = t._count.id;
  });

  return (
    <div className="space-y-6">
      {/* Top Context & Action Bar */}
      <div className="pb-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mb-0.5">
            <span className="text-zinc-300 font-semibold">{user.activeOrg.name}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">Environment: All Targets</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">System Overview</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/runs"
            className="px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium border border-white/[0.08] transition-colors"
          >
            Run History
          </Link>
          <Link
            href="/dashboard/projects/new"
            className="px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </Link>
        </div>
      </div>

      {/* Engineering Telemetry KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard label="Projects" value={totalProjects} subtext={`${totalSuites} suites`} />
        <MetricCard label="Total Tests" value={totalTests} subtext="Across 5 engines" />
        <MetricCard label="Total Runs" value={totalRuns} subtext="Historical executions" />
        <MetricCard
          label="Pass Rate"
          value={`${passRate}%`}
          status={passRate >= 90 ? "success" : passRate >= 70 ? "warning" : "error"}
          subtext={`${passedRuns} passed`}
        />
        <MetricCard
          label="Failures"
          value={failedRuns}
          status={failedRuns > 0 ? "error" : "success"}
          subtext="Requires attention"
        />
      </div>

      {/* Main Grid: Recent Test Runs (2/3) + Activity / Engine Fleet (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Runs Table */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">
                Recent Test Runs
              </h2>
            </div>
            <Link
              href="/dashboard/runs"
              className="text-[11px] font-mono text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span>View all runs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="data-table-container">
            {recentRuns.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400 font-mono">
                No recent executions found. Run an automated test to generate telemetry.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Test / Scope</th>
                    <th>Project</th>
                    <th>Duration</th>
                    <th>Env</th>
                    <th>Started</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((r) => {
                    const firstResult = r.testResults[0];
                    const testTitle = firstResult?.testTitle || r.suite?.name || "Suite Execution";
                    const durationStr = r.durationMs ? `${(r.durationMs / 1000).toFixed(2)}s` : "-";
                    const timeAgo = formatTimeAgo(r.createdAt);

                    return (
                      <tr key={r.id}>
                        <td>
                          <StatusBadge status={r.status} size="sm" />
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {firstResult?.testType && (
                              <EngineBadge type={firstResult.testType} size="xs" />
                            )}
                            <span className="font-medium text-zinc-200 truncate max-w-[200px]" title={testTitle}>
                              {testTitle}
                            </span>
                          </div>
                        </td>
                        <td className="text-zinc-400">
                          <Link
                            href={`/dashboard/projects/${r.project.id}`}
                            className="hover:text-zinc-200 truncate max-w-[120px] block"
                          >
                            {r.project.name}
                          </Link>
                        </td>
                        <td className="font-mono text-zinc-400">{durationStr}</td>
                        <td>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                            {r.environment}
                          </span>
                        </td>
                        <td className="text-zinc-400 font-mono">{timeAgo}</td>
                        <td className="text-right">
                          <Link
                            href={`/dashboard/projects/${r.project.id}/runs/${r.id}/report`}
                            className="text-[11px] font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
                          >
                            Report &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Engine Fleet & Activity Summary */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Layers className="w-4 h-4 text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">
                Testing Engine Fleet
              </h2>
            </div>

            <div className="surface-card p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <EngineBadge type="UI" size="xs" />
                  <span className="text-zinc-300">Playwright Browser</span>
                </div>
                <span className="font-mono text-zinc-400">{engineMap.UI} tests</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <EngineBadge type="API" size="xs" />
                  <span className="text-zinc-300">HTTP / REST API</span>
                </div>
                <span className="font-mono text-zinc-400">{engineMap.API} tests</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <EngineBadge type="ACCESSIBILITY" size="xs" />
                  <span className="text-zinc-300">axe-core WCAG A/AA</span>
                </div>
                <span className="font-mono text-zinc-400">{engineMap.ACCESSIBILITY} tests</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <EngineBadge type="PERFORMANCE" size="xs" />
                  <span className="text-zinc-300">Core Web Vitals</span>
                </div>
                <span className="font-mono text-zinc-400">{engineMap.PERFORMANCE} tests</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <EngineBadge type="SEO" size="xs" />
                  <span className="text-zinc-300">Technical SEO Audit</span>
                </div>
                <span className="font-mono text-zinc-400">{engineMap.SEO} tests</span>
              </div>
            </div>
          </div>

          {/* Quick CLI status callout */}
          <div className="surface-card p-3.5 space-y-2 border-emerald-500/20 bg-emerald-950/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Developer CLI
              </span>
              <span className="text-[10px] font-mono text-zinc-400">ready</span>
            </div>
            <p className="text-xs text-zinc-300">
              Trigger test runs directly from your terminal or CI/CD pipelines.
            </p>
            <pre className="p-2 rounded bg-black/50 text-[11px] font-mono text-zinc-300 border border-white/[0.06] overflow-x-auto">
              <code>omnitest run --project {projects[0]?.id ? projects[0].id.slice(0, 8) : "all"}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">
              Active Projects
            </h2>
          </div>
          <Link
            href="/dashboard/projects"
            className="text-[11px] font-mono text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>All projects</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p) => {
            const lastRun = p.testRuns[0];
            return (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.id}`}
                className="surface-card p-3.5 surface-hover block space-y-2.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate block">
                      {p.name}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 truncate block">
                      {p.baseUrl || "No target URL"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 shrink-0 flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    {p.defaultBranch}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-zinc-400">
                  <span>{p._count.testSuites} suites</span>
                  {lastRun ? (
                    <StatusBadge status={lastRun.status} size="sm" />
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-400">No runs yet</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
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
