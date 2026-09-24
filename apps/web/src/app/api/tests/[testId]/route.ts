import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { validateTestSpec } from "@/lib/runner/validator";
import { validateApiTestSpec } from "@/lib/runner/api-validator";
import { validateA11yTestSpec } from "@/lib/runner/a11y-validator";
import { validatePerformanceTestSpec } from "@/lib/runner/perf-validator";
import { validateSeoTestSpec } from "@/lib/runner/seo-validator";

export async function GET(
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
      testResults: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          artifacts: true,
        },
      },
    },
  });

  if (!test || test.suite.project.organization.members.length === 0) {
    return NextResponse.json({ error: "Test not found or access denied." }, { status: 404 });
  }

  return NextResponse.json({
    test: {
      id: test.id,
      title: test.title,
      description: test.description,
      type: test.type,
      config: typeof test.config === "string" ? JSON.parse(test.config) : test.config,
      timeoutSeconds: test.timeoutSeconds,
      isActive: test.isActive,
      suiteId: test.suiteId,
      suiteName: test.suite.name,
      projectId: test.suite.projectId,
      projectName: test.suite.project.name,
      createdAt: test.createdAt,
      recentResults: test.testResults.map((r) => ({
        id: r.id,
        testRunId: r.testRunId,
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
          url: `/artifacts/runs/${r.testRunId}/${a.fileName}`,
        })),
        createdAt: r.createdAt,
      })),
    },
  });
}

export async function PATCH(
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
    const body = await request.json();
    const { title, description, steps, timeoutSeconds } = body;

    const existingConfig = typeof test.config === "string" ? JSON.parse(test.config) : test.config;
    let validatedConfig: any;

    if (test.type === "API") {
      validatedConfig = validateApiTestSpec(body.apiConfig || body);
    } else if (test.type === "ACCESSIBILITY") {
      validatedConfig = validateA11yTestSpec(body.a11yConfig || body);
    } else if (test.type === "PERFORMANCE") {
      validatedConfig = validatePerformanceTestSpec(body.perfConfig || body.performanceConfig || body);
    } else if (test.type === "SEO") {
      validatedConfig = validateSeoTestSpec(body.seoConfig || body);
    } else {
      validatedConfig = validateTestSpec({
        version: "1.0",
        name: title ? title.trim() : test.title,
        description: description !== undefined ? description?.trim() : test.description || undefined,
        timeoutSeconds: timeoutSeconds ? Number(timeoutSeconds) : test.timeoutSeconds,
        steps: steps || existingConfig.steps || [],
      });
    }

    const updated = await db.test.update({
      where: { id: params.testId },
      data: {
        title: title ? title.trim() : test.title,
        description: description !== undefined ? description?.trim() || null : test.description,
        timeoutSeconds: timeoutSeconds ? Number(timeoutSeconds) : test.timeoutSeconds,
        config: JSON.stringify(validatedConfig),
      },
    });

    return NextResponse.json({
      test: {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        config: JSON.parse(updated.config as string),
        timeoutSeconds: updated.timeoutSeconds,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: unknown) {
    console.error("Update test error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update test." },
      { status: 400 }
    );
  }
}

export async function DELETE(
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

  await db.test.delete({
    where: { id: params.testId },
  });

  return NextResponse.json({ success: true, message: "Test deleted successfully" });
}
