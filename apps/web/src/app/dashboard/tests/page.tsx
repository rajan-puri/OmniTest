import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  FileCode2,
  Play,
  CheckCircle2,
  XCircle,
  Plus,
  FolderGit2,
  Globe2,
  Eye,
  Zap,
  Search,
} from "lucide-react";

export default async function TestsDirectoryPage() {
  const user = await getAuthenticatedUser();
  if (!user || !user.activeOrg) return null;

  const tests = await db.test.findMany({
    where: {
      suite: {
        project: {
          organizationId: user.activeOrg.id,
        },
      },
    },
    include: {
      suite: {
        include: {
          project: {
            select: { id: true, name: true },
          },
        },
      },
      testResults: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          status: true,
          durationMs: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileCode2 className="w-6 h-6 text-cyan-400" />
            Automated Tests
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            All quality specs and browser workflows across {user.activeOrg.name}.
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

      {tests.length === 0 ? (
        <div className="py-16 px-4 rounded-2xl glass-panel text-center border border-dashed border-white/[0.12] space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
            <FileCode2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No automated tests yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Open one of your projects and click &quot;New Test&quot; to author browser automation workflows.
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
        <div className="grid grid-cols-1 gap-3">
          {tests.map((t) => {
            const lastResult = t.testResults[0];
            const config = typeof t.config === "string" ? JSON.parse(t.config) : t.config;
            const isApi = t.type === "API";
            const isA11y = t.type === "ACCESSIBILITY";
            const isPerf = t.type === "PERFORMANCE";
            const isSeo = t.type === "SEO";
            const stepCount = isApi
              ? (config.assertions?.length || 0)
              : isA11y
              ? (config.standards?.length || 2)
              : isPerf
              ? (config.thresholds?.length || 0)
              : isSeo
              ? 11
              : (config.steps?.length || 0);

            return (
              <div
                key={t.id}
                className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 mb-1">
                    <span>{t.suite.project.name}</span>
                    <span>/</span>
                    <span>{t.suite.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mb-1">
                    {isApi ? (
                      <Globe2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isA11y ? (
                      <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : isPerf ? (
                      <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : isSeo ? (
                      <Search className="w-4 h-4 text-teal-400 shrink-0" />
                    ) : (
                      <FileCode2 className="w-4 h-4 text-brand-400 shrink-0" />
                    )}
                    <Link
                      href={`/dashboard/tests/${t.id}`}
                      className="text-sm font-bold text-white hover:text-brand-400 transition-colors"
                    >
                      {t.title}
                    </Link>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isApi
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                          : isA11y
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                          : isPerf
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/25"
                          : isSeo
                          ? "bg-teal-500/15 text-teal-300 border border-teal-500/25"
                          : "bg-brand-500/15 text-brand-300 border border-brand-500/25"
                      }`}
                    >
                      {isApi
                        ? "API"
                        : isA11y
                        ? "Accessibility"
                        : isPerf
                        ? "Performance"
                        : isSeo
                        ? "SEO"
                        : "Browser"}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                      {isApi
                        ? `${stepCount} assertions`
                        : isA11y
                        ? `${stepCount} standards`
                        : isPerf
                        ? `${stepCount} thresholds`
                        : isSeo
                        ? `${stepCount} checks`
                        : `${stepCount} steps`}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {t.description || "No description."}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  {lastResult ? (
                    <span
                      className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 ${
                        lastResult.status === "PASSED"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                          : "bg-rose-500/15 text-rose-300 border border-rose-500/25"
                      }`}
                    >
                      {lastResult.status === "PASSED" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      {lastResult.status} ({lastResult.durationMs}ms)
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-[11px]">No runs yet</span>
                  )}

                  <Link
                    href={`/dashboard/tests/${t.id}`}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-white/[0.08]"
                  >
                    <Play className="w-3 h-3 fill-current text-brand-400" />
                    Open &amp; Run
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
