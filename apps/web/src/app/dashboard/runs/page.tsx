import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  FolderGit2,
  ArrowRight,
  FileText,
} from "lucide-react";

export default async function RunsDirectoryPage() {
  const user = await getAuthenticatedUser();
  if (!user || !user.activeOrg) return null;

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
      testResults: {
        take: 1,
        select: {
          testId: true,
          testTitle: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <PlayCircle className="w-6 h-6 text-violet-400" />
            Execution Runs &amp; Grid
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Execution history, pass/fail status, and diagnostic metrics across {user.activeOrg.name}.
          </p>
        </div>

        <Link
          href="/dashboard/projects"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <FolderGit2 className="w-4 h-4" />
          View by Project
        </Link>
      </div>

      {runs.length === 0 ? (
        <div className="py-16 px-4 rounded-2xl glass-panel text-center border border-dashed border-white/[0.12] space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto">
            <PlayCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No test runs recorded yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Test runs are triggered whenever you click &quot;Run Test Now&quot; on an automated test.
            </p>
          </div>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
          >
            Go to Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => {
            const isPassed = run.status === "PASSED";
            const firstTest = run.testResults[0];

            return (
              <div
                key={run.id}
                className="p-4 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  {isPassed ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                      <XCircle className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white">
                        Run #{run.id.slice(0, 8)}
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-300">{run.project.name}</span>
                      {firstTest?.testTitle && (
                        <>
                          <span className="text-zinc-500">•</span>
                          <span className="text-brand-300 font-sans font-semibold">
                            {firstTest.testTitle}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      Target: {run.targetUrl} • Trigger: {run.trigger}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono shrink-0">
                  {run.durationMs && (
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {run.durationMs}ms
                    </span>
                  )}
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      isPassed
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {run.status}
                  </span>

                  {firstTest?.testId && (
                    <Link
                      href={`/dashboard/tests/${firstTest.testId}`}
                      className="text-zinc-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  <Link
                    href={`/dashboard/projects/${run.project.id}/runs/${run.id}/report`}
                    className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/25 flex items-center gap-1 font-semibold transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    Report
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
