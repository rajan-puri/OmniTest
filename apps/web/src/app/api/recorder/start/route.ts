import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { recorderManager } from "@/lib/recorder/manager";

// POST /api/recorder/start - Launch recorder browser session
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, url } = body;

    if (!projectId || !url) {
      return NextResponse.json(
        { error: "projectId and target url are required." },
        { status: 400 }
      );
    }

    // Validate project access
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
      return NextResponse.json(
        { error: "Project not found or access denied." },
        { status: 404 }
      );
    }

    const sessionId = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const session = await recorderManager.startSession(sessionId, projectId, url);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      actions: session.actions,
      message: "Browser session started. User interactions and navigations will be captured.",
    });
  } catch (error: unknown) {
    console.error("Start recorder error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start recorder session." },
      { status: 500 }
    );
  }
}
