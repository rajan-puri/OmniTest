import { chromium, Browser, BrowserContext, Page } from "playwright";
import fs from "fs";
import path from "path";
import axeCore from "axe-core";
import {
  A11yTestSpec,
  A11yExecutionResult,
  A11yRuleResult,
  A11yImpact,
} from "./a11y-types";
import { checkUrlSecurity } from "./api-executor";

export interface A11yExecutionOptions {
  runId: string;
  artifactDir: string;
  publicUrlPrefix?: string;
  baseUrl?: string;
}

export async function executeA11yTest(
  spec: A11yTestSpec,
  options?: Partial<A11yExecutionOptions>
): Promise<A11yExecutionResult> {
  const startTime = Date.now();
  const runId = options?.runId || `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const artifactDir = options?.artifactDir || path.join(process.cwd(), "public", "artifacts", "runs");
  const runArtifactDir = path.join(artifactDir, runId);
  fs.mkdirSync(runArtifactDir, { recursive: true });

  const publicPrefix = options?.publicUrlPrefix || `/artifacts/runs/${runId}`;

  // 1. Resolve URL
  let resolvedUrl = spec.url;
  if (!resolvedUrl.startsWith("http://") && !resolvedUrl.startsWith("https://")) {
    if (options?.baseUrl) {
      resolvedUrl = new URL(resolvedUrl, options.baseUrl).toString();
    } else {
      throw new Error(`Relative URL "${spec.url}" provided without a configured project Base URL.`);
    }
  }

  // SSRF check
  checkUrlSecurity(resolvedUrl);

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let screenshotUrl: string | undefined;

  try {
    // Launch headless Chromium using existing browser infrastructure
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    page = await context.newPage();
    const timeoutMs = (spec.timeoutSeconds || 30) * 1000;
    page.setDefaultTimeout(timeoutMs);

    // Navigate to target page
    await page.goto(resolvedUrl, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });

    // Wait a brief moment for dynamic DOM elements / fonts to settle
    await page.waitForTimeout(500);

    // Page Screenshot for evidence
    try {
      const screenshotFileName = `a11y_scan_${runId.slice(0, 8)}.png`;
      const screenshotPath = path.join(runArtifactDir, screenshotFileName);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      screenshotUrl = `${publicPrefix}/${screenshotFileName}`;
    } catch {
      // Non-fatal screenshot error
    }

    // Inject axe-core script into the live page
    await page.evaluate(axeCore.source);

    // Prepare axe run options based on spec standards & scope
    const axeContext =
      spec.scope === "selector" && spec.selector
        ? spec.selector
        : undefined;

    const axeOptions = {
      runOnly: {
        type: "tag",
        values: spec.standards && spec.standards.length > 0 ? spec.standards : ["wcag2a", "wcag2aa"],
      },
    };

    // Execute axe-core analysis inside the page context
    const axeResults: any = await page.evaluate(
      ({ ctx, opts }) => {
        return (window as any).axe.run(ctx || document, opts);
      },
      { ctx: axeContext, opts: axeOptions }
    );

    // Transform axe results cleanly into OmniTest A11yRuleResult contracts
    const transformRules = (rules: any[]): A11yRuleResult[] => {
      if (!Array.isArray(rules)) return [];
      return rules.map((r) => ({
        id: r.id,
        impact: r.impact as A11yImpact | undefined,
        description: r.description || "",
        help: r.help || "",
        helpUrl: r.helpUrl || "",
        tags: Array.isArray(r.tags) ? r.tags : [],
        nodes: Array.isArray(r.nodes)
          ? r.nodes.map((n: any) => ({
              target: Array.isArray(n.target) ? n.target : [String(n.target || "")],
              html: typeof n.html === "string" ? n.html.slice(0, 500) : "", // safe truncation
              failureSummary: n.failureSummary,
            }))
          : [],
      }));
    };

    const violations = transformRules(axeResults.violations);
    const passes = transformRules(axeResults.passes);
    const incomplete = transformRules(axeResults.incomplete);
    const inapplicable = transformRules(axeResults.inapplicable);

    // Tally severity counts
    let critical = 0;
    let serious = 0;
    let moderate = 0;
    let minor = 0;

    for (const v of violations) {
      if (v.impact === "critical") critical += v.nodes.length || 1;
      else if (v.impact === "serious") serious += v.nodes.length || 1;
      else if (v.impact === "moderate") moderate += v.nodes.length || 1;
      else if (v.impact === "minor") minor += v.nodes.length || 1;
      else moderate += v.nodes.length || 1;
    }

    const durationMs = Date.now() - startTime;
    const hasViolations = violations.length > 0;
    const overallStatus: "PASSED" | "FAILED" = hasViolations ? "FAILED" : "PASSED";

    let errorSummary: string | undefined;
    if (hasViolations) {
      const topImpact = critical > 0 ? "critical" : serious > 0 ? "serious" : "accessibility";
      errorSummary = `${violations.length} ${topImpact} rule violation${
        violations.length === 1 ? "" : "s"
      } detected (${critical} critical, ${serious} serious, ${moderate} moderate, ${minor} minor).`;
    }

    return {
      status: overallStatus,
      durationMs,
      url: resolvedUrl,
      timestamp: new Date().toISOString(),
      violations,
      passes,
      incomplete,
      inapplicable,
      summary: {
        critical,
        serious,
        moderate,
        minor,
        totalViolations: violations.length,
        totalPasses: passes.length,
        totalIncomplete: incomplete.length,
      },
      screenshotUrl,
      errorSummary,
    };
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    const isTimeout = message.toLowerCase().includes("timeout");

    return {
      status: isTimeout ? "TIMED_OUT" : "FAILED",
      durationMs,
      url: resolvedUrl,
      timestamp: new Date().toISOString(),
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
      summary: {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0,
        totalViolations: 0,
        totalPasses: 0,
        totalIncomplete: 0,
      },
      screenshotUrl,
      errorSummary: `Accessibility scan failed: ${message}`,
    };
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}
