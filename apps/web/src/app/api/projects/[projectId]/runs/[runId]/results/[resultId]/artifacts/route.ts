import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { compileResultArtifacts } from "@/lib/artifacts/artifact-helper";
import { TestResultArtifactsResponse } from "@/lib/artifacts/artifact-types";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; runId: string; resultId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, runId, resultId } = params;

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

  // Retrieve test run
  const run = await db.testRun.findUnique({
    where: { id: runId },
  });

  if (!run || run.projectId !== projectId) {
    return NextResponse.json({ error: "Test run not found in this project." }, { status: 404 });
  }

  // Retrieve test result with associated physical artifacts
  const testResult = await db.testResult.findUnique({
    where: { id: resultId },
    include: {
      artifacts: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!testResult || testResult.testRunId !== runId) {
    return NextResponse.json({ error: "Test result not found in this run." }, { status: 404 });
  }

  // Compile full set of physical and diagnostic artifacts
  const artifacts = compileResultArtifacts(projectId, runId, testResult);

  const response: TestResultArtifactsResponse = {
    project: {
      id: project.id,
      name: project.name,
      slug: project.slug,
    },
    testRun: {
      id: run.id,
      status: run.status,
      trigger: run.trigger,
      environment: run.environment,
      createdAt: run.createdAt.toISOString(),
    },
    testResult: {
      id: testResult.id,
      testId: testResult.testId,
      testTitle: testResult.testTitle,
      testType: testResult.testType,
      status: testResult.status,
      durationMs: testResult.durationMs,
      errorMessage: testResult.errorMessage,
      createdAt: testResult.createdAt.toISOString(),
    },
    artifacts,
  };

  return NextResponse.json(response);
}
