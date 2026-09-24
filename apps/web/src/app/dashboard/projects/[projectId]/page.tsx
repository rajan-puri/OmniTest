import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  FolderGit2,
  ExternalLink,
  GitBranch,
  Edit3,
  Clock,
  PlayCircle,
  FileCode2,
  ArrowLeft,
  Calendar,
  Layers,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Video,
  Globe2,
  Eye,
  Zap,
  Search,
} from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const user = await getAuthenticatedUser();
  if (!user || !user.activeOrg) return null;

  const project = await db.project.findUnique({
    where: { id: params.projectId },
    include: {
      organization: {
        include: {
          members: {
            where: { userId: user.id },
            select: { role: true },
          },
        },
      },
      testSuites: {
        include: {
          _count: {
            select: { tests: true },
          },
        },
      },
      testRuns: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project || project.organization.members.length === 0) {
    notFound();
  }

  const tests = await db.test.findMany({
    where: { suite: { projectId: params.projectId } },
    include: {
      suite: { select: { id: true, name: true } },
      testResults: {
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
    orderBy: { createdAt: "desc" },
  });

  const userRole = project.organization.members[0].role;
  const canEdit = userRole === "OWNER" || userRole === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Back link & Header */}
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
              <span>{project.organization.name}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-200">{project.slug}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              {project.description || "No project description provided."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/projects/${project.id}/tests/new`}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Test
            </Link>

            <Link
              href={`/dashboard/projects/${project.id}/tests/new`}
              className="px-3.5 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-semibold text-xs border border-brand-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              Record Test
            </Link>

            {canEdit && (
              <Link
                href={`/dashboard/projects/${project.id}/edit`}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs flex items-center gap-1.5 border border-white/[0.08] transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Settings
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Target URLs & Repo info bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-white/[0.08] text-xs">
          <span className="text-zinc-500 font-mono block mb-1">Target Base URL</span>
          {project.baseUrl ? (
            <a
              href={project.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline flex items-center gap-1 font-mono truncate"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{project.baseUrl}</span>
            </a>
          ) : (
            <span className="text-zinc-500 font-mono">Not configured</span>
          )}
        </div>

        <div className="p-4 rounded-xl glass-panel border border-white/[0.08] text-xs">
          <span className="text-zinc-500 font-mono block mb-1">Git Repository &amp; Branch</span>
          <div className="flex items-center gap-1.5 font-mono text-zinc-300 truncate">
            <GitBranch className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{project.defaultBranch}</span>
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white ml-1"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-white/[0.08] text-xs">
          <span className="text-zinc-500 font-mono block mb-1">Created Date</span>
          <div className="flex items-center gap-1.5 font-mono text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Automated Tests List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            Automated Tests ({tests.length})
          </h2>
          <Link
            href={`/dashboard/projects/${project.id}/tests/new`}
            className="text-xs font-mono text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Create Test
          </Link>
        </div>

        {tests.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl glass-panel border border-dashed border-white/[0.12] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">No automated tests defined yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                Create a test like &quot;Homepage loads&quot; to test navigation, assertions, and screenshot capture.
              </p>
            </div>
            <Link
              href={`/dashboard/projects/${project.id}/tests/new`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Test
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

      {/* Recent Test Runs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-violet-400" />
            Recent Executions ({project.testRuns.length})
          </h2>
        </div>

        {project.testRuns.length === 0 ? (
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.06] text-center text-xs text-zinc-500">
            No execution history recorded yet. Runs triggered from tests will appear here.
          </div>
        ) : (
          <div className="space-y-2">
            {project.testRuns.map((run) => (
              <div
                key={run.id}
                className="p-3.5 rounded-xl glass-panel border border-white/[0.06] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">Run #{run.id.slice(0, 8)}</span>
                  <span className="text-zinc-500 font-mono">{run.environment}</span>
                  <span className="text-zinc-500 font-mono">{run.targetUrl}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  {run.durationMs && (
                    <span className="text-zinc-400">{run.durationMs}ms</span>
                  )}
                  <span
                    className={`font-bold ${
                      run.status === "PASSED"
                        ? "text-emerald-400"
                        : run.status === "FAILED"
                        ? "text-rose-400"
                        : "text-amber-400"
                    }`}
                  >
                    {run.status}
                  </span>
                  <Link
                    href={`/dashboard/projects/${project.id}/runs/${run.id}/report`}
                    className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 hover:underline ml-1"
                  >
                    Report &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
