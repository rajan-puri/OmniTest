import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FolderGit2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

export default async function ReportsDirectoryPage() {
  const user = await getAuthenticatedUser();
  if (!user || !user.activeOrg) return null;

  // Fetch recent test runs with test results
  const runs = await db.testRun.findMany({
    where: {
      project: {
        organizationId: user.activeOrg.id,
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

  // Calculate aggregated stats
  const totalReports = runs.length;
  const passedReports = runs.filter((r) => r.status === "PASSED").length;
  const overallPassRate =
    totalReports > 0 ? Math.round((passedReports / totalReports) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-400" />
            Quality &amp; Test Reports
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Aggregated test execution reports across UI, API, Accessibility, Performance, and SEO testing engines.
          </p>
        </div>

        <Link
          href="/dashboard/runs"
          className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 font-semibold text-xs border border-white/[0.08] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Layers className="w-4 h-4" />
          Execution Runs Grid
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl glass-panel border border-white/[0.08]">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Generated Reports
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {totalReports}
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-white/[0.08]">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Passing Runs
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {passedReports} <span className="text-xs text-zinc-500 font-normal">/ {totalReports}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-white/[0.08]">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Run Success Rate
          </span>
          <div className="text-2xl font-bold font-mono text-brand-400">
            {overallPassRate}%
          </div>
        </div>
      </div>

      {/* Reports Listing */}
      {runs.length === 0 ? (
        <div className="py-16 px-4 rounded-2xl glass-panel text-center border border-dashed border-white/[0.12] space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No test reports generated yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Test reports are automatically compiled whenever a test suite or automated test is executed.
            </p>
          </div>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
          >
            <FolderGit2 className="w-4 h-4" /> Go to Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            Recent Test Reports ({runs.length})
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {runs.map((run) => {
              const isPassed = run.status === "PASSED";
              const totalTests = run.testResults.length;
              const passedTests = run.testResults.filter((r) => r.status === "PASSED").length;
              const failedTests = run.testResults.filter((r) => r.status === "FAILED" || r.status === "TIMED_OUT").length;
              const passPct = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

              // Extract unique engine types present in this run
              const typesPresent = Array.from(new Set(run.testResults.map((r) => r.testType)));

              return (
                <div
                  key={run.id}
                  className="p-4 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {isPassed ? (
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <XCircle className="w-5 h-5" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="font-bold text-white">
                          Report #{run.id.slice(0, 8)}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-300 font-semibold">{run.project.name}</span>
                        {run.suite && (
                          <>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-400">{run.suite.name}</span>
                          </>
                        )}
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-600" />
                          {new Date(run.createdAt).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400">
                        <span>Target: <strong className="text-zinc-300">{run.targetUrl}</strong></span>
                        <span className="text-zinc-600">•</span>
                        <span>Env: <strong className="text-zinc-300">{run.environment}</strong></span>
                        <span className="text-zinc-600">•</span>
                        <span>Trigger: <strong className="text-zinc-300">{run.trigger}</strong></span>
                      </div>

                      {/* Engine types pill list */}
                      {typesPresent.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {typesPresent.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] border border-white/[0.08] text-zinc-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Metrics & View Report Action */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.06] font-mono text-xs">
                    {run.durationMs && (
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {run.durationMs}ms
                      </span>
                    )}

                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">{passedTests} passed</span>
                        {failedTests > 0 && (
                          <span className="text-rose-400 font-bold">/ {failedTests} failed</span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {passPct}% pass rate ({totalTests} {totalTests === 1 ? "test" : "tests"})
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/projects/${run.project.id}/runs/${run.id}/report`}
                      className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Report
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
