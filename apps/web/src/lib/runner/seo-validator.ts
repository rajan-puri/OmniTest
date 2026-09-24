import { SeoTestSpec, SeoCheckCategories, SeoAssertions } from "./seo-types";

export function validateSeoTestSpec(raw: unknown): SeoTestSpec {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid SEO test specification: expected JSON object.");
  }

  const spec = raw as Record<string, unknown>;

  // 1. Target URL
  if (typeof spec.url !== "string" || !spec.url.trim()) {
    throw new Error("SEO test requires a non-empty 'url' string.");
  }

  const url = spec.url.trim();
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid URL format: "${url}".`);
    }
  } else if (!url.startsWith("/")) {
    throw new Error(`Target URL must start with http://, https://, or a relative path ('/'): "${url}".`);
  }

  // 2. Timeout
  let timeoutSeconds = 30;
  if (spec.timeoutSeconds !== undefined) {
    if (typeof spec.timeoutSeconds !== "number" || isNaN(spec.timeoutSeconds)) {
      throw new Error("Timeout must be a valid number of seconds.");
    }
    timeoutSeconds = Math.min(Math.max(Math.floor(spec.timeoutSeconds), 5), 120);
  }

  // 3. Checks configuration
  const checks: SeoCheckCategories = {
    technical: true,
    metadata: true,
    indexability: true,
    headings: true,
    images: true,
    links: true,
    social: true,
    structuredData: true,
    robotsTxt: true,
    sitemap: true,
    mobile: true,
  };

  if (spec.checks && typeof spec.checks === "object") {
    const rawChecks = spec.checks as Record<string, unknown>;
    if (typeof rawChecks.technical === "boolean") checks.technical = rawChecks.technical;
    if (typeof rawChecks.metadata === "boolean") checks.metadata = rawChecks.metadata;
    if (typeof rawChecks.indexability === "boolean") checks.indexability = rawChecks.indexability;
    if (typeof rawChecks.headings === "boolean") checks.headings = rawChecks.headings;
    if (typeof rawChecks.images === "boolean") checks.images = rawChecks.images;
    if (typeof rawChecks.links === "boolean") checks.links = rawChecks.links;
    if (typeof rawChecks.social === "boolean") checks.social = rawChecks.social;
    if (typeof rawChecks.structuredData === "boolean") checks.structuredData = rawChecks.structuredData;
    if (typeof rawChecks.robotsTxt === "boolean") checks.robotsTxt = rawChecks.robotsTxt;
    if (typeof rawChecks.sitemap === "boolean") checks.sitemap = rawChecks.sitemap;
    if (typeof rawChecks.mobile === "boolean") checks.mobile = rawChecks.mobile;
  }

  // 4. Assertions configuration
  const assertions: SeoAssertions = {
    titleRequired: true,
    metaDescriptionRequired: true,
    canonicalRequired: true,
    h1Required: true,
    noindexDisallowed: false,
    expectedStatusCode: 200,
    structuredDataRequired: false,
    noBrokenLinks: false,
  };

  if (spec.assertions && typeof spec.assertions === "object") {
    const rawAssertions = spec.assertions as Record<string, unknown>;
    if (typeof rawAssertions.titleRequired === "boolean") {
      assertions.titleRequired = rawAssertions.titleRequired;
    }
    if (typeof rawAssertions.metaDescriptionRequired === "boolean") {
      assertions.metaDescriptionRequired = rawAssertions.metaDescriptionRequired;
    }
    if (typeof rawAssertions.canonicalRequired === "boolean") {
      assertions.canonicalRequired = rawAssertions.canonicalRequired;
    }
    if (typeof rawAssertions.h1Required === "boolean") {
      assertions.h1Required = rawAssertions.h1Required;
    }
    if (typeof rawAssertions.noindexDisallowed === "boolean") {
      assertions.noindexDisallowed = rawAssertions.noindexDisallowed;
    }
    if (typeof rawAssertions.expectedStatusCode === "number" && !isNaN(rawAssertions.expectedStatusCode)) {
      assertions.expectedStatusCode = Math.floor(rawAssertions.expectedStatusCode);
    }
    if (typeof rawAssertions.structuredDataRequired === "boolean") {
      assertions.structuredDataRequired = rawAssertions.structuredDataRequired;
    }
    if (typeof rawAssertions.maxRedirects === "number" && !isNaN(rawAssertions.maxRedirects)) {
      assertions.maxRedirects = Math.max(0, Math.floor(rawAssertions.maxRedirects));
    }
    if (typeof rawAssertions.noBrokenLinks === "boolean") {
      assertions.noBrokenLinks = rawAssertions.noBrokenLinks;
    }
  }

  return {
    version: "1.0",
    url,
    timeoutSeconds,
    checks,
    assertions,
  };
}
