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
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default async function DashboardOverviewPage() {
  const user = await getAuthenticatedUser();
  if (!user || !user.activeOrg) return null;

  const projects = await db.project.findMany({
    where: { organizationId: user.activeOrg.id },
    include: {
      _count: {
        select: {
          testSuites: true,
          testRuns: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const totalProjects = await db.project.count({
    where: { organizationId: user.activeOrg.id },
  });

  const totalSuites = await db.testSuite.count({
    where: { project: { organizationId: user.activeOrg.id } },
  });

  const totalRuns = await db.testRun.count({
    where: { project: { organizationId: user.activeOrg.id } },
  });

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <Building2 className="w-3.5 h-3.5 text-brand-400" />
            <span>{user.activeOrg.name}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">Overview</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {user.fullName.split(" ")[0]}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Here is what&apos;s happening with your test infrastructure today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/projects/new"
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08]">
          <div className="flex items-center justify-between text-zinc-400 mb-3 text-xs font-mono">
            <span>ACTIVE PROJECTS</span>
            <FolderGit2 className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalProjects}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Applications configured</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08]">
          <div className="flex items-center justify-between text-zinc-400 mb-3 text-xs font-mono">
            <span>TEST SUITES</span>
            <FileCode2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalSuites}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Quality suites defined</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08]">
          <div className="flex items-center justify-between text-zinc-400 mb-3 text-xs font-mono">
            <span>TOTAL TEST RUNS</span>
            <PlayCircle className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{totalRuns}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Cloud executions</p>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-brand-400" />
            Projects
          </h2>
          <Link
            href="/dashboard/projects"
            className="text-xs font-mono text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            View All ({totalProjects}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl glass-panel text-center border border-dashed border-white/[0.12] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 mx-auto">
              <FolderGit2 className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">No projects created yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                Create your first project to start defining automated test suites and running tests on the cloud grid.
              </p>
            </div>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all group block"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                    {project.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                    {project.defaultBranch}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-4">
                  {project.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-[11px] font-mono text-zinc-500">
                  <span>{project._count.testSuites} Suites</span>
                  <span>{project._count.testRuns} Runs</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
