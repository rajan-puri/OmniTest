import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TestsManagementTable, SerializedTestItem } from "@/components/tests/TestsManagementTable";

export default async function TestsDirectoryPage() {
  const user = await getAuthenticatedUser();
  if (!user || !user.activeOrg) return null;

  const orgId = user.activeOrg.id;

  const [tests, projects] = await Promise.all([
    db.test.findMany({
      where: {
        suite: {
          project: {
            organizationId: orgId,
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
      orderBy: { updatedAt: "desc" },
    }),
    db.project.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedTests: SerializedTestItem[] = tests.map((t) => {
    let isVisual = false;
    try {
      const cfg = typeof t.config === "string" ? JSON.parse(t.config) : t.config;
      isVisual = Boolean(cfg?.visualRegression?.enabled);
    } catch {}

    const last = t.testResults[0] || null;

    return {
      id: t.id,
      title: t.title,
      type: t.type,
      suiteId: t.suiteId,
      suiteName: t.suite.name,
      projectId: t.suite.project.id,
      projectName: t.suite.project.name,
      isVisual,
      lastResult: last
        ? {
            status: last.status,
            durationMs: last.durationMs,
            createdAt: last.createdAt.toISOString(),
          }
        : null,
      updatedAt: t.updatedAt.toISOString(),
    };
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Test Management"
        description={`All quality specs and automated workflows configured across ${user.activeOrg.name}.`}
        breadcrumbs={[{ label: user.activeOrg.name }, { label: "Tests" }]}
        actions={
          <Link
            href="/dashboard/projects"
            className="px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Test via Project
          </Link>
        }
      />

      <TestsManagementTable tests={serializedTests} projects={projects} />
    </div>
  );
}
