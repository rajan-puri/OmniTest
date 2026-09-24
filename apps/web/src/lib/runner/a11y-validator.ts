import { A11yTestSpec, A11yStandard } from "./a11y-types";

const ALLOWED_STANDARDS: A11yStandard[] = ["wcag2a", "wcag2aa", "best-practice"];

export function validateA11yTestSpec(raw: unknown): A11yTestSpec {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid Accessibility test specification: Expected an object.");
  }

  const spec = raw as Partial<A11yTestSpec>;

  if (!spec.url || typeof spec.url !== "string" || !spec.url.trim()) {
    throw new Error("Target URL is required for accessibility testing.");
  }

  const trimmedUrl = spec.url.trim();

  // Basic URL structure check
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    try {
      new URL(trimmedUrl);
    } catch {
      throw new Error(`Invalid URL format: "${trimmedUrl}"`);
    }
  }

  const scope: "page" | "selector" = spec.scope === "selector" ? "selector" : "page";
  const selector = scope === "selector" && spec.selector ? spec.selector.trim() : undefined;

  let standards: A11yStandard[] = ["wcag2a", "wcag2aa"];
  if (Array.isArray(spec.standards) && spec.standards.length > 0) {
    standards = spec.standards.filter((s) => ALLOWED_STANDARDS.includes(s));
    if (standards.length === 0) {
      standards = ["wcag2a", "wcag2aa"];
    }
  }

  const timeoutSeconds = typeof spec.timeoutSeconds === "number" && spec.timeoutSeconds > 0
    ? Math.min(Math.max(spec.timeoutSeconds, 5), 120)
    : 30;

  return {
    version: "1.0",
    url: trimmedUrl,
    scope,
    selector,
    standards,
    timeoutSeconds,
  };
}
