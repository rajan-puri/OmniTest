import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { recorderManager } from "@/lib/recorder/manager";

// GET /api/recorder/[sessionId] - Poll recorded actions in active session
export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = params;
  const session = recorderManager.getSession(sessionId);

  if (!session) {
    return NextResponse.json(
      { error: "Recorder session not found or already terminated." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    sessionId: session.id,
    isActive: session.isActive,
    url: session.url,
    actionsCount: session.actions.length,
    actions: session.actions,
  });
}

// POST /api/recorder/[sessionId] - Perform action on active session (interact, add assertion, etc.)
export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = params;
  const session = recorderManager.getSession(sessionId);

  if (!session || !session.isActive) {
    return NextResponse.json(
      { error: "Active recorder session not found." },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { type, action, target, value } = body;

    // Check if user is capturing an assertion manually during recording
    if (type === "assertion") {
      const recorded = await recorderManager.captureAssertion(
        sessionId,
        action,
        target,
        value
      );
      return NextResponse.json({ success: true, action: recorded });
    }

    // Direct browser interaction command (e.g. click element or navigate)
    if (type === "interact") {
      if (action === "goto" && target) {
        await session.page.goto(target, { waitUntil: "domcontentloaded", timeout: 15000 });
      } else if (action === "click" && target) {
        await session.page.click(target, { timeout: 10000 });
      } else if (action === "fill" && target) {
        await session.page.fill(target, value || "", { timeout: 10000 });
      } else if (action === "press" && target) {
        await session.page.keyboard.press(target);
      }
      return NextResponse.json({ success: true, actions: session.actions });
    }

    return NextResponse.json({ error: "Invalid request payload type." }, { status: 400 });
  } catch (error: unknown) {
    console.error("Recorder session interaction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interaction failed." },
      { status: 500 }
    );
  }
}
