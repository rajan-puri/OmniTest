export type A11yStandard = "wcag2a" | "wcag2aa" | "best-practice";

export interface A11yTestSpec {
  version: "1.0";
  url: string;
  scope?: "page" | "selector";
  selector?: string; // e.g. "#main-content"
  standards?: A11yStandard[]; // e.g. ["wcag2a", "wcag2aa", "best-practice"]
  timeoutSeconds?: number;
}

export type A11yImpact = "critical" | "serious" | "moderate" | "minor";

export interface A11yNodeResult {
  target: string[];
  html: string;
  failureSummary?: string;
}

export interface A11yRuleResult {
  id: string;
  impact?: A11yImpact;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: A11yNodeResult[];
}

export interface A11yExecutionResult {
  status: "PASSED" | "FAILED" | "TIMED_OUT";
  durationMs: number;
  url: string;
  timestamp: string;
  violations: A11yRuleResult[];
  passes: A11yRuleResult[];
  incomplete: A11yRuleResult[];
  inapplicable: A11yRuleResult[];
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    totalViolations: number;
    totalPasses: number;
    totalIncomplete: number;
  };
  screenshotUrl?: string;
  errorSummary?: string;
}
