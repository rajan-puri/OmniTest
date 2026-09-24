import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { getProjectTestHistory } from "@/lib/history/history-service";
import { TestHistoryFilter } from "@/lib/history/history-types";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = params;

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

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const filter: TestHistoryFilter = {
    testId: searchParams.get("testId") || undefined,
    status: searchParams.get("status") || undefined,
    testType: searchParams.get("testType") || undefined,
    dateRange: (searchParams.get("dateRange") as any) || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    search: searchParams.get("search") || undefined,
    sortBy: (searchParams.get("sortBy") as any) || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    page: searchParams.has("page") ? parseInt(searchParams.get("page")!, 10) : 1,
    pageSize: searchParams.has("pageSize") ? parseInt(searchParams.get("pageSize")!, 10) : 20,
  };

  try {
    const history = await getProjectTestHistory(projectId, filter);
    return NextResponse.json(history);
  } catch (error: any) {
    console.error("Failed to fetch project test history:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve test history." },
      { status: 500 }
    );
  }
}
