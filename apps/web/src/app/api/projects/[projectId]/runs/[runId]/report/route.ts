import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { generateRunReport } from "@/lib/reports/report-generator";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, runId } = params;

  // Retrieve project and verify user organization authorization
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

  // Retrieve test run with all test results and artifacts
  const run = await db.testRun.findUnique({
    where: { id: runId },
    include: {
      project: {
        select: { id: true, name: true, slug: true, baseUrl: true },
      },
      suite: {
        select: { id: true, name: true },
      },
      testResults: {
        include: {
          artifacts: {
            select: { id: true, type: true, fileName: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!run || run.projectId !== projectId) {
    return NextResponse.json({ error: "Test run not found in this project." }, { status: 404 });
  }

  const report = generateRunReport(run);

  // Check for download / export query param
  const url = new URL(request.url);
  const isExport = url.searchParams.get("format") === "json" || url.searchParams.get("export") === "json";

  if (isExport) {
    return new NextResponse(JSON.stringify(report, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="omnitest-report-${run.id.slice(0, 8)}.json"`,
      },
    });
  }

  return NextResponse.json({ report });
}
