import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { compareTestRuns } from "@/lib/history/history-service";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const user = await getAuthenticatedUser();
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

  const { searchParams } = new URL(request.url);
  const baseRunId = searchParams.get("baseRunId");
  const targetRunId = searchParams.get("targetRunId");

  if (!baseRunId || !targetRunId) {
    return NextResponse.json(
      { error: "Both 'baseRunId' and 'targetRunId' query parameters are required." },
      { status: 400 }
    );
  }

  try {
    const comparison = await compareTestRuns(projectId, baseRunId, targetRunId);
    return NextResponse.json(comparison);
  } catch (error: any) {
    console.error("Run comparison error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to compare test runs." },
      { status: 400 }
    );
  }
}
