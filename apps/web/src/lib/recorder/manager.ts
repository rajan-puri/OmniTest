import { chromium, Browser, BrowserContext, Page } from "playwright";
import { generateStableSelectorScript } from "./script";
import { TestStep, StepAction } from "../runner/types";

export interface RecordedAction {
  id: string;
  action: StepAction;
  target?: string;
  value?: string;
  timestamp: number;
}

export interface RecorderSession {
  id: string;
  projectId: string;
  url: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  actions: RecordedAction[];
  isActive: boolean;
  createdAt: number;
}

class RecorderSessionManager {
  private sessions: Map<string, RecorderSession> = new Map();

  public async startSession(
    sessionId: string,
    projectId: string,
    initialUrl: string
  ): Promise<RecorderSession> {
    // If an existing session exists for this id, close it first
    if (this.sessions.has(sessionId)) {
      await this.stopSession(sessionId);
    }

    // Launch Playwright in headed or headless mode
    // In server environments or CLI test setups, default to headless unless DISPLAY is configured
    // On Mac, headed mode can open directly if supported, but headless works reliably everywhere
    const isHeadless = process.env.PLAYWRIGHT_HEADLESS !== "false";

    const browser = await chromium.launch({
      headless: isHeadless,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    const session: RecorderSession = {
      id: sessionId,
      projectId,
      url: initialUrl,
      browser,
      context,
      page,
      actions: [],
      isActive: true,
      createdAt: Date.now(),
    };

    this.sessions.set(sessionId, session);

    // Initial navigation action
    session.actions.push({
      id: `rec_${Date.now()}_0`,
      action: "goto",
      target: initialUrl,
      timestamp: Date.now(),
    });

    // Expose binding so browser page can send captured user events back to Node.js
    await page.exposeFunction(
      "__omnitest_dispatch_event",
      (event: { action: StepAction; target?: string; value?: string }) => {
        if (!session.isActive) return;

        // Debounce or filter duplicate consecutive fills for same selector
        const lastAction = session.actions[session.actions.length - 1];
        if (
          event.action === "fill" &&
          lastAction &&
          lastAction.action === "fill" &&
          lastAction.target === event.target
        ) {
          lastAction.value = event.value;
          lastAction.timestamp = Date.now();
          return;
        }

        const newAction: RecordedAction = {
          id: `rec_${Date.now()}_${session.actions.length}`,
          action: event.action,
          target: event.target,
          value: event.value,
          timestamp: Date.now(),
        };

        session.actions.push(newAction);
      }
    );

    // Inject listener script on every frame navigation
    await page.addInitScript(generateStableSelectorScript());

    // Listen to URL navigation changes
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame() && session.isActive) {
        const currentUrl = page.url();
        // If not the initial url navigation, record it
        const lastAction = session.actions[session.actions.length - 1];
        if (lastAction && lastAction.target !== currentUrl && currentUrl !== "about:blank") {
          session.actions.push({
            id: `rec_${Date.now()}_${session.actions.length}`,
            action: "goto",
            target: currentUrl,
            timestamp: Date.now(),
          });
        }
      }
    });

    // Navigate to initial target URL
    await page.goto(initialUrl, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    }).catch((err) => {
      console.warn(`Initial navigation warning for ${initialUrl}:`, err.message);
    });

    // Automatically append an initial assertion verifying page loaded
    session.actions.push({
      id: `rec_${Date.now()}_assert`,
      action: "assert_visible",
      target: "body",
      timestamp: Date.now(),
    });

    return session;
  }

  public getSession(sessionId: string): RecorderSession | undefined {
    return this.sessions.get(sessionId);
  }

  public async captureAssertion(
    sessionId: string,
    action: "assert_url" | "assert_text" | "assert_visible" | "screenshot",
    target?: string,
    value?: string
  ): Promise<RecordedAction> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error(`Active recorder session ${sessionId} not found.`);
    }

    let resolvedTarget = target;
    let resolvedValue = value;

    if (action === "assert_url" && !resolvedTarget) {
      resolvedTarget = session.page.url();
    } else if (action === "screenshot" && !resolvedValue) {
      resolvedValue = `screenshot_rec_${session.actions.length + 1}`;
    }

    const recorded: RecordedAction = {
      id: `rec_${Date.now()}_${session.actions.length}`,
      action,
      target: resolvedTarget,
      value: resolvedValue,
      timestamp: Date.now(),
    };

    session.actions.push(recorded);
    return recorded;
  }

  public async stopSession(sessionId: string): Promise<TestStep[]> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    session.isActive = false;

    try {
      await session.page.close().catch(() => {});
      await session.context.close().catch(() => {});
      await session.browser.close().catch(() => {});
    } catch (e) {
      console.error("Error closing recorder browser:", e);
    }

    // Convert recorded actions into standard OmniTest TestStep format
    const generatedSteps: TestStep[] = session.actions.map((act, index) => {
      const step: TestStep = {
        id: `step_${index + 1}`,
        action: act.action,
        target: act.target,
        value: act.value,
      };

      if (act.action === "goto") {
        step.options = { timeoutMs: 15000 };
      } else if (act.action.startsWith("assert_")) {
        step.options = { timeoutMs: 5000 };
      }

      return step;
    });

    this.sessions.delete(sessionId);
    return generatedSteps;
  }
}

// Global singleton instance across Next.js API route invocations
const globalForRecorder = globalThis as unknown as {
  omnitestRecorderManager: RecorderSessionManager | undefined;
};

export const recorderManager =
  globalForRecorder.omnitestRecorderManager || new RecorderSessionManager();

if (process.env.NODE_ENV !== "production") {
  globalForRecorder.omnitestRecorderManager = recorderManager;
}
