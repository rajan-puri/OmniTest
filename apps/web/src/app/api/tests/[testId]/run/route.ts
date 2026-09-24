import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { orchestrateTestRun } from "@/lib/runner/orchestrator";

export async function POST(
  request: Request,
  { params }: { params: { testId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const test = await db.test.findUnique({
    where: { id: params.testId },
    include: {
      suite: {
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
        },
      },
    },
  });

  if (!test || test.suite.project.organization.members.length === 0) {
    return NextResponse.json({ error: "Test not found or access denied." }, { status: 404 });
  }

  try {
    let targetUrl: string | undefined;
    try {
      const body = await request.json();
      targetUrl = body.targetUrl;
    } catch {
      // Body is optional
    }

    const execution = await orchestrateTestRun({
      testId: test.id,
      projectId: test.suite.projectId,
      trigger: "MANUAL",
      environment: "staging",
      targetUrl: targetUrl || test.suite.project.baseUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      runId: execution.run.id,
      status: execution.run.status,
      durationMs: execution.run.durationMs,
      testResult: {
        id: execution.testResult.id,
        status: execution.testResult.status,
        stepResults: JSON.parse(execution.testResult.stepResults as string),
        metrics: JSON.parse(execution.testResult.metrics as string),
        errorMessage: execution.testResult.errorMessage,
        artifacts: execution.result.artifacts,
      },
    });
  } catch (error: unknown) {
    console.error("Test execution orchestration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Execution failed." },
      { status: 500 }
    );
  }
}
