import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { recorderManager } from "@/lib/recorder/manager";

// POST /api/recorder/[sessionId]/stop - Terminate session and return generated TestStep[]
export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = params;

  try {
    const generatedSteps = await recorderManager.stopSession(sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      totalSteps: generatedSteps.length,
      steps: generatedSteps,
    });
  } catch (error: unknown) {
    console.error("Stop recorder error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to stop recording session." },
      { status: 500 }
    );
  }
}
