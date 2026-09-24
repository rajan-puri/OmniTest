import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { getTestBaseline } from "@/lib/visual/baseline-manager";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      projectId: string;
      runId: string;
      resultId: string;
    };
  }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, runId, resultId } = params;

  // Verify access
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

  const testResult = await db.testResult.findUnique({
    where: { id: resultId },
    include: {
      testRun: true,
      test: true,
      artifacts: true,
    },
  });

  if (!testResult || testResult.testRunId !== runId) {
    return NextResponse.json({ error: "Test result not found." }, { status: 404 });
  }

  let metrics: any = {};
  try {
    metrics = typeof testResult.metrics === "string" ? JSON.parse(testResult.metrics) : testResult.metrics;
  } catch {}

  const visualComparison = metrics?.visualComparison || null;

  // Retrieve current active baseline info for the test
  let baseline = null;
  if (testResult.testId) {
    baseline = await getTestBaseline(testResult.testId);
  }

  // Look for artifacts
  const currentArt = testResult.artifacts.find((a) => a.type === "VISUAL_CURRENT");
  const diffArt = testResult.artifacts.find((a) => a.type === "VISUAL_DIFF");
  const baseArt = testResult.artifacts.find((a) => a.type === "VISUAL_BASELINE");

  const currentUrl = currentArt
    ? `/artifacts/runs/${runId}/${currentArt.fileName}`
    : visualComparison?.currentUrl || null;

  const diffUrl = diffArt
    ? `/artifacts/runs/${runId}/${diffArt.fileName}`
    : visualComparison?.diffUrl || null;

  const baselineUrl = baseline?.exists
    ? baseline.url
    : baseArt
    ? `/artifacts/runs/${runId}/${baseArt.fileName}`
    : visualComparison?.baselineUrl || null;

  return NextResponse.json({
    projectId,
    runId,
    resultId,
    testId: testResult.testId,
    testTitle: testResult.testTitle,
    status: testResult.status,
    visualComparison: visualComparison
      ? {
          ...visualComparison,
          currentUrl,
          diffUrl,
          baselineUrl,
          currentArtifactId: currentArt?.id || visualComparison.currentArtifactId,
          diffArtifactId: diffArt?.id || visualComparison.diffArtifactId,
        }
      : null,
    baseline,
    artifacts: testResult.artifacts.map((a) => ({
      id: a.id,
      type: a.type,
      fileName: a.fileName,
      url: `/artifacts/runs/${runId}/${a.fileName}`,
      sizeBytes: Number(a.sizeBytes),
      contentType: a.contentType,
    })),
  });
}
