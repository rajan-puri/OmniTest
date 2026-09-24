import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { FolderGit2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { RunsManagementTable, SerializedRunItem } from "@/components/runs/RunsManagementTable";

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
      suite: {
        select: { id: true, name: true },
      },
      testResults: {
        take: 1,
        select: {
          testId: true,
          testTitle: true,
          testType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const serializedRuns: SerializedRunItem[] = runs.map((r) => {
    const firstResult = r.testResults[0];
    return {
      id: r.id,
      projectId: r.project.id,
      projectName: r.project.name,
      suiteName: r.suite?.name || "Suite",
      testTitle: firstResult?.testTitle || r.suite?.name || "Test Run",
      testType: firstResult?.testType || null,
      status: r.status,
      trigger: r.trigger,
      environment: r.environment,
      gitCommitHash: r.gitCommitHash,
      gitBranch: r.gitBranch,
      durationMs: r.durationMs,
      createdAt: r.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Test Runs & CI History"
        description={`Execution telemetry, pass/fail status, and diagnostic metrics across ${user.activeOrg.name}.`}
        breadcrumbs={[{ label: user.activeOrg.name }, { label: "Test Runs" }]}
        actions={
          <Link
            href="/dashboard/projects"
            className="px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium border border-white/[0.08] flex items-center gap-1.5 transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            View Projects
          </Link>
        }
      />

      <RunsManagementTable runs={serializedRuns} />
    </div>
  );
}
