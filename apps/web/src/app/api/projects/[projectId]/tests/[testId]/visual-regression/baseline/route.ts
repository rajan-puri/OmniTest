import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  getTestBaseline,
  setBaselineFromArtifact,
  deleteBaseline,
  saveBaselineFromBuffer,
} from "@/lib/visual/baseline-manager";

async function verifyTestAccess(projectId: string, testId: string, userId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        include: {
          members: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!project || project.organization.members.length === 0) {
    return { error: "Project not found or access denied.", status: 404 };
  }

  const test = await db.test.findUnique({
    where: { id: testId },
    include: { suite: true },
  });

  if (!test || test.suite.projectId !== projectId) {
    return { error: "Test not found in this project.", status: 404 };
  }

  return { project, test };
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; testId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, testId } = params;
  const access = await verifyTestAccess(projectId, testId, user.id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const baseline = await getTestBaseline(testId);
  return NextResponse.json({ baseline });
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string; testId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, testId } = params;
  const access = await verifyTestAccess(projectId, testId, user.id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = await request.json();
    const { artifactId, base64Image, runId, resultId } = body;

    let baselineInfo;
    if (artifactId) {
      baselineInfo = await setBaselineFromArtifact(testId, artifactId, user.email);
    } else if (base64Image) {
      const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), "base64");
      baselineInfo = await saveBaselineFromBuffer(testId, buffer, {
        userEmail: user.email,
        testRunId: runId,
        testResultId: resultId,
      });
    } else {
      return NextResponse.json(
        { error: "Must provide either artifactId or base64Image to set baseline." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Baseline updated successfully.",
      baseline: baselineInfo,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error setting baseline:", err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; testId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, testId } = params;
  const access = await verifyTestAccess(projectId, testId, user.id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    await deleteBaseline(testId);
    return NextResponse.json({
      success: true,
      message: "Baseline removed successfully.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
