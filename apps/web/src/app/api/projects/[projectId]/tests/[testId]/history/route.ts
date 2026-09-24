import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { getProjectTestHistory } from "@/lib/history/history-service";
import { TestHistoryFilter } from "@/lib/history/history-types";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; testId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, testId } = params;

  // Security check: verify project ownership / access through organization membership
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        include: {
          members: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  if (!project || project.organization.members.length === 0) {
    return NextResponse.json({ error: "Project not found or access denied." }, { status: 404 });
  }

  // Verify test exists and belongs to this project
  const test = await db.test.findUnique({
    where: { id: testId },
    include: {
      suite: {
        select: { projectId: true },
      },
    },
  });

  if (!test || test.suite.projectId !== projectId) {
    return NextResponse.json({ error: "Test not found in this project." }, { status: 404 });
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const filter: TestHistoryFilter = {
    testId,
    status: searchParams.get("status") || undefined,
    dateRange: (searchParams.get("dateRange") as any) || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    sortBy: (searchParams.get("sortBy") as any) || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    page: searchParams.has("page") ? parseInt(searchParams.get("page")!, 10) : 1,
    pageSize: searchParams.has("pageSize") ? parseInt(searchParams.get("pageSize")!, 10) : 20,
  };

  try {
    const history = await getProjectTestHistory(projectId, filter);
    return NextResponse.json({
      test: {
        id: test.id,
        title: test.title,
        type: test.type,
      },
      ...history,
    });
  } catch (error: any) {
    console.error("Failed to fetch test-specific history:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve test history." },
      { status: 500 }
    );
  }
}
