import React from "react";
import { notFound } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TestHistoryViewer } from "@/components/history/TestHistoryViewer";

interface HistoryPageProps {
  params: { projectId: string };
  searchParams: {
    testId?: string;
    status?: string;
    testType?: string;
    dateRange?: string;
    search?: string;
  };
}

export default async function ProjectHistoryPage({
  params,
  searchParams,
}: HistoryPageProps) {
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
    },
  });

  if (!project || project.organization.members.length === 0) {
    notFound();
  }

  // Fetch list of automated tests in this project for the filter dropdown
  const tests = await db.test.findMany({
    where: { suite: { projectId: params.projectId } },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <TestHistoryViewer
      projectId={project.id}
      projectName={project.name}
      projectSlug={project.slug}
      availableTests={tests}
      initialFilter={{
        testId: searchParams.testId,
        status: searchParams.status,
        testType: searchParams.testType,
        dateRange: searchParams.dateRange as any,
        search: searchParams.search,
      }}
    />
  );
}
