import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  FolderGit2,
  Plus,
  GitBranch,
  ExternalLink,
  History,
  Layers,
  Settings,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
      testSuites: {
        include: {
          _count: {
            select: { tests: true },
          },
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
          environment: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        description={`Manage web applications, repositories, and environment targets for ${user.activeOrg.name}.`}
        breadcrumbs={[{ label: user.activeOrg.name }, { label: "Projects" }]}
        actions={
          <Link
            href="/dashboard/projects/new"
            className="px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Project
          </Link>
        }
      />

      {projects.length === 0 ? (
        <div className="p-12 text-center surface-card border-dashed max-w-lg mx-auto my-8 space-y-3">
          <FolderGit2 className="w-8 h-8 text-zinc-500 mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-white">No projects found</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Add your first repository or web application target to start running tests.
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Target / Repo</th>
                <th>Branch</th>
                <th>Suites / Tests</th>
                <th>Last Run</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const lastRun = project.testRuns[0];
                const totalTests = project.testSuites.reduce(
                  (acc, s) => acc + (s._count?.tests || 0),
                  0
                );
                const lastRunTime = lastRun ? formatTimeAgo(lastRun.createdAt) : "-";
                const lastRunDuration = lastRun?.durationMs
                  ? `${(lastRun.durationMs / 1000).toFixed(1)}s`
                  : "";

                return (
                  <tr key={project.id}>
                    <td>
                      <div>
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="font-semibold text-white hover:text-emerald-400 transition-colors block text-xs"
                        >
                          {project.name}
                        </Link>
                        {project.description && (
                          <span className="text-[11px] text-zinc-400 line-clamp-1 max-w-[240px]">
                            {project.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-400 max-w-[180px] truncate">
                        {project.baseUrl ? (
                          <a
                            href={project.baseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-zinc-200 truncate flex items-center gap-1"
                          >
                            <span>{project.baseUrl.replace(/^https?:\/\//, "")}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ) : project.repositoryUrl ? (
                          <a
                            href={project.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-zinc-200 truncate flex items-center gap-1"
                          >
                            <span>{project.repositoryUrl.replace(/^https?:\/\/github\.com\//, "")}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-zinc-400">Local Environment</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                        <GitBranch className="w-3 h-3 text-zinc-500" />
                        {project.defaultBranch}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-zinc-300">
                        {project._count.testSuites} <span className="text-zinc-400">suites</span> / {totalTests} <span className="text-zinc-400">tests</span>
                      </span>
                    </td>
                    <td>
                      {lastRun ? (
                        <div className="text-[11px] font-mono">
                          <span className="text-zinc-300">{lastRunTime}</span>
                          {lastRunDuration && (
                            <span className="text-zinc-400 ml-1.5">({lastRunDuration})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-zinc-400">Never</span>
                      )}
                    </td>
                    <td>
                      {lastRun ? (
                        <StatusBadge status={lastRun.status} size="sm" />
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-mono">Inactive</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/dashboard/projects/${project.id}/history`}
                          title="Execution History"
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/dashboard/projects/${project.id}/edit`}
                          title="Settings"
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="text-[11px] font-mono font-medium text-emerald-400 hover:text-emerald-300 ml-1"
                        >
                          View &rarr;
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
