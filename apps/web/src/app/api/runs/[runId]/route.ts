import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { runId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const run = await db.testRun.findUnique({
    where: { id: params.runId },
    include: {
      project: {
        include: {
          organization: {
            include: {
              members: {
                where: { userId: user.id },
              },
            },
          },
        },
      },
      testResults: {
        include: {
          artifacts: true,
        },
      },
      artifacts: true,
    },
  });

  if (!run || run.project.organization.members.length === 0) {
    return NextResponse.json({ error: "Run not found or access denied." }, { status: 404 });
  }

  return NextResponse.json({
    run: {
      id: run.id,
      projectId: run.projectId,
      projectName: run.project.name,
      status: run.status,
      trigger: run.trigger,
      environment: run.environment,
      targetUrl: run.targetUrl,
      durationMs: run.durationMs,
      totalTests: run.totalTests,
      passedTests: run.passedTests,
      failedTests: run.failedTests,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      errorSummary: run.errorSummary,
      results: run.testResults.map((r) => ({
        id: r.id,
        testId: r.testId,
        testTitle: r.testTitle,
        testType: r.testType,
        status: r.status,
        durationMs: r.durationMs,
        errorMessage: r.errorMessage,
        stackTrace: r.stackTrace,
        stepResults: typeof r.stepResults === "string" ? JSON.parse(r.stepResults) : r.stepResults,
        metrics: typeof r.metrics === "string" ? JSON.parse(r.metrics) : r.metrics,
        artifacts: r.artifacts.map((a) => ({
          id: a.id,
          type: a.type,
          fileName: a.fileName,
          url: `/artifacts/runs/${run.id}/${a.fileName}`,
          sizeBytes: Number(a.sizeBytes),
        })),
      })),
    },
  });
}
