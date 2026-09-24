import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  FolderGit2,
  Plus,
  ExternalLink,
  GitBranch,
  ArrowRight,
  Clock,
  Layers,
} from "lucide-react";

export default async function ProjectsPage() {
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
      testRuns: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-brand-400" />
            Projects
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage web applications, repositories, and environment targets for {user.activeOrg.name}.
          </p>
        </div>

        <Link
          href="/dashboard/projects/new"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </Link>
      </div>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="py-16 px-4 rounded-2xl glass-panel text-center border border-dashed border-white/[0.12] space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 mx-auto">
            <FolderGit2 className="w-7 h-7 text-brand-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No projects yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Add your first repository or web application to begin orchestrating tests with Playwright, axe-core, and Lighthouse.
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="text-base font-bold text-white group-hover:text-brand-400 transition-colors truncate"
                  >
                    {project.name}
                  </Link>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 shrink-0 flex items-center gap-1">
                    <GitBranch className="w-3 h-3 text-zinc-500" />
                    {project.defaultBranch}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 mb-4">
                  {project.description || "No description configured."}
                </p>

                {project.baseUrl && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mb-4 truncate">
                    <ExternalLink className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{project.baseUrl}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-500">
                  <Layers className="w-3.5 h-3.5" />
                  {project._count.testSuites} Suites • {project._count.testRuns} Runs
                </span>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5"
                >
                  Open <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
