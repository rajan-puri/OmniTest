import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { orchestrateTestRun } from "@/lib/runner/orchestrator";

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = params;

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

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional
  }

  const { testIds, type, visual, environment = "staging", targetUrl } = body;

  const whereClause: any = {
    suite: { projectId },
    isActive: true,
  };

  if (Array.isArray(testIds) && testIds.length > 0) {
    whereClause.id = { in: testIds };
  }

  if (type && typeof type === "string" && type.toUpperCase() !== "ALL") {
    whereClause.type = type.toUpperCase();
  }

  const tests = await db.test.findMany({
    where: whereClause,
    orderBy: { createdAt: "asc" },
  });

  // If visual filter specified, filter tests that have visualRegression enabled in config
  const filteredTests = visual
    ? tests.filter((t) => {
        try {
          const cfg = typeof t.config === "string" ? JSON.parse(t.config) : t.config;
          return Boolean(cfg?.visualRegression?.enabled);
        } catch {
          return false;
        }
      })
    : tests;

  if (filteredTests.length === 0) {
    return NextResponse.json(
      {
        success: true,
        message: "No matching tests found to execute.",
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        durationMs: 0,
        status: "PASSED",
        results: [],
      },
      { status: 200 }
    );
  }

  const startTime = Date.now();
  const results: any[] = [];
  let passedCount = 0;
  let failedCount = 0;
  let latestRunId = "";

  // Execute matching tests sequentially using existing orchestrator
  for (const t of filteredTests) {
    try {
      const execution = await orchestrateTestRun({
        testId: t.id,
        projectId,
        trigger: "CLI",
        environment,
        targetUrl: targetUrl || project.baseUrl || undefined,
      });

      latestRunId = execution.run.id;
      const isPassed = execution.testResult.status === "PASSED";
      if (isPassed) passedCount++;
      else failedCount++;

      results.push({
        id: execution.testResult.id,
        runId: execution.run.id,
        testId: t.id,
        testTitle: t.title,
        testType: t.type,
        status: execution.testResult.status,
        durationMs: execution.testResult.durationMs,
        errorMessage: execution.testResult.errorMessage,
        artifacts: execution.result?.artifacts || [],
      });
    } catch (err: any) {
      failedCount++;
      results.push({
        id: `err_${Date.now()}`,
        runId: latestRunId,
        testId: t.id,
        testTitle: t.title,
        testType: t.type,
        status: "FAILED",
        durationMs: 0,
        errorMessage: err?.message || "Execution exception",
        artifacts: [],
      });
    }
  }

  const totalDuration = Date.now() - startTime;
  const overallStatus = failedCount === 0 ? "PASSED" : "FAILED";

  return NextResponse.json({
    success: true,
    runId: latestRunId,
    projectId,
    status: overallStatus,
    totalTests: filteredTests.length,
    passedTests: passedCount,
    failedTests: failedCount,
    durationMs: totalDuration,
    results,
  });
}
