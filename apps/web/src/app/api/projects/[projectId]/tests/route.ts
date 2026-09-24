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

  const tests = await db.test.findMany({
    where: { suite: { projectId } },
    include: {
      suite: {
        select: { id: true, name: true },
      },
      testResults: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          status: true,
          durationMs: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    tests: tests.map((t) => ({
      id: t.id,
      suiteId: t.suiteId,
      suiteName: t.suite.name,
      title: t.title,
      description: t.description,
      type: t.type,
      config: typeof t.config === "string" ? JSON.parse(t.config) : t.config,
      timeoutSeconds: t.timeoutSeconds,
      isActive: t.isActive,
      createdAt: t.createdAt,
      lastResult: t.testResults[0] || null,
    })),
  });
}

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
      testSuites: {
        take: 1,
      },
    },
  });

  if (!project || project.organization.members.length === 0) {
    return NextResponse.json({ error: "Project not found or access denied." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { title, description, type = "UI", steps, apiConfig, timeoutSeconds, suiteId } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Test title is required." }, { status: 400 });
    }

    const testType =
      type === "API"
        ? "API"
        : type === "ACCESSIBILITY"
        ? "ACCESSIBILITY"
        : type === "PERFORMANCE"
        ? "PERFORMANCE"
        : type === "SEO"
        ? "SEO"
        : "UI";
    let validatedConfig: any;

    if (testType === "API") {
      validatedConfig = validateApiTestSpec(apiConfig || body);
    } else if (testType === "ACCESSIBILITY") {
      validatedConfig = validateA11yTestSpec(body.a11yConfig || body);
    } else if (testType === "PERFORMANCE") {
      validatedConfig = validatePerformanceTestSpec(body.perfConfig || body.performanceConfig || body);
    } else if (testType === "SEO") {
      validatedConfig = validateSeoTestSpec(body.seoConfig || body);
    } else {
      // Validate UI step definitions
      validatedConfig = validateTestSpec({
        version: "1.0",
        name: title.trim(),
        description: description?.trim(),
        timeoutSeconds: timeoutSeconds ? Number(timeoutSeconds) : 30,
        steps: steps || [],
      });
    }

    // Ensure suite exists or create default suite
    let targetSuiteId = suiteId;
    if (!targetSuiteId) {
      if (project.testSuites.length > 0) {
        targetSuiteId = project.testSuites[0].id;
      } else {
        const defaultSuite = await db.testSuite.create({
          data: {
            projectId: project.id,
            name: "Core Tests",
            description: "Default suite for automated workflows",
          },
        });
        targetSuiteId = defaultSuite.id;
      }
    }

    const test = await db.test.create({
      data: {
        suiteId: targetSuiteId,
        title: title.trim(),
        description: description?.trim() || null,
        type: testType,
        config: JSON.stringify(validatedConfig),
        timeoutSeconds: timeoutSeconds ? Number(timeoutSeconds) : 30,
      },
    });

    return NextResponse.json(
      {
        test: {
          id: test.id,
          suiteId: test.suiteId,
          title: test.title,
          description: test.description,
          type: test.type,
          config: JSON.parse(test.config as string),
          timeoutSeconds: test.timeoutSeconds,
          createdAt: test.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create test error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create test." },
      { status: 400 }
    );
  }
}
