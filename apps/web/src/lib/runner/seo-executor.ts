import fs from "fs";
import path from "path";
import { chromium, Browser, BrowserContext, Page } from "playwright";
import {
  SeoTestSpec,
  SeoExecutionResult,
  SeoFinding,
  SeoAssertionResult,
  SeoRedirectStep,
  SeoImageItem,
  SeoLinkItem,
  SeoJsonLdItem,
  SeoPageDetails,
} from "./seo-types";
import { checkUrlSecurity } from "./api-executor";

export interface SeoExecutionOptions {
  runId: string;
  artifactDir: string;
  publicUrlPrefix?: string;
  baseUrl?: string;
}

/**
 * Executes an automated single-page technical SEO inspection using headless Chromium.
 */
export async function executeSeoTest(
  spec: SeoTestSpec,
  options: SeoExecutionOptions
): Promise<SeoExecutionResult> {
  const startTime = Date.now();

  // 1. Resolve target URL
  let resolvedUrl = spec.url;
  if (!resolvedUrl.startsWith("http://") && !resolvedUrl.startsWith("https://")) {
    if (options.baseUrl) {
      resolvedUrl = new URL(resolvedUrl, options.baseUrl).toString();
    } else {
      throw new Error(`Relative URL "${spec.url}" provided without a configured project Base URL.`);
    }
  }

  // 2. Validate URL security (SSRF Guard)
  checkUrlSecurity(resolvedUrl);

  const timeoutMs = (spec.timeoutSeconds || 30) * 1000;
  const redirectChain: SeoRedirectStep[] = [];
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OmniTest-Bot/1.0",
      ignoreHTTPSErrors: true,
    });

    const page: Page = await context.newPage();

    let mainResponse: any = null;
    let initialRedirectTracked = false;

    // Listen to responses to capture redirect chain
    page.on("response", (res) => {
      const status = res.status();
      if (status >= 300 && status < 400) {
        redirectChain.push({
          url: res.url(),
          status,
        });
      }
    });

    // Navigate to page
    try {
      mainResponse = await page.goto(resolvedUrl, {
        timeout: timeoutMs,
        waitUntil: "domcontentloaded",
      });
      // Allow brief period for deferred scripts/DOM to settle
      await page.waitForLoadState("load", { timeout: 3000 }).catch(() => {});
    } catch (navErr: any) {
      const durationMs = Date.now() - startTime;
      const errorMsg = navErr?.message || "Navigation failed";
      return buildFailedResult(resolvedUrl, errorMsg, durationMs, spec);
    }

    const finalUrl = page.url();
    const httpStatus = mainResponse ? mainResponse.status() : 0;
    const httpStatusText = mainResponse ? mainResponse.statusText() : "Unknown";

    // Capture response headers
    const headers = mainResponse ? mainResponse.headers() : {};
    const xRobotsTagRaw = headers["x-robots-tag"] || null;
    const xRobotsDirectives = xRobotsTagRaw
      ? xRobotsTagRaw.toLowerCase().split(",").map((d: string) => d.trim()).filter(Boolean)
      : [];

    // Capture visual screenshot artifact
    let screenshotUrl: string | undefined;
    try {
      fs.mkdirSync(options.artifactDir, { recursive: true });
      const screenshotFileName = `seo_scan_${options.runId.slice(0, 8)}.png`;
      const screenshotFilePath = path.join(options.artifactDir, screenshotFileName);
      await page.screenshot({ path: screenshotFilePath, fullPage: true });
      screenshotUrl = options.publicUrlPrefix
        ? `${options.publicUrlPrefix}/${screenshotFileName}`
        : `/artifacts/runs/${options.runId}/${screenshotFileName}`;
    } catch {
      // Screenshot non-fatal
    }

    // 3. In-page DOM extraction via page.evaluate
    const domData = await page.evaluate(() => {
      // Title
      const titleTag = document.querySelector("title");
      const titleValue = titleTag ? titleTag.textContent || "" : null;

      // Meta Description
      const metaDesc = document.querySelector('meta[name="description" i]') as HTMLMetaElement | null;
      const metaDescValue = metaDesc ? metaDesc.getAttribute("content") : null;

      // Canonical
      const canonicalTags = Array.from(document.querySelectorAll('link[rel="canonical" i]'));
      const canonicalValue = canonicalTags.length > 0 ? canonicalTags[0].getAttribute("href") : null;
      const hasMultipleCanonicals = canonicalTags.length > 1;

      // Robots meta
      const robotsMeta = document.querySelector('meta[name="robots" i]') as HTMLMetaElement | null;
      const robotsMetaRaw = robotsMeta ? robotsMeta.getAttribute("content") : null;

      // Headings
      const h1Nodes = Array.from(document.querySelectorAll("h1"));
      const h1Texts = h1Nodes.map((h) => (h.textContent || "").trim()).filter(Boolean);
      const h2Count = document.querySelectorAll("h2").length;
      const h3Count = document.querySelectorAll("h3").length;
      const h4Count = document.querySelectorAll("h4").length;
      const h5Count = document.querySelectorAll("h5").length;
      const h6Count = document.querySelectorAll("h6").length;

      const allHeadings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      let emptyHeadingsCount = 0;
      const hierarchyIssues: string[] = [];
      let lastLevel = 0;

      for (const heading of allHeadings) {
        const text = (heading.textContent || "").trim();
        if (!text) emptyHeadingsCount++;

        const currentLevel = parseInt(heading.tagName.replace("H", ""), 10);
        if (lastLevel > 0 && currentLevel > lastLevel + 1) {
          hierarchyIssues.push(`Skipped heading level from H${lastLevel} directly to H${currentLevel}`);
        }
        lastLevel = currentLevel;
      }

      // Images
      const imgNodes = Array.from(document.querySelectorAll("img"));
      const images: {
        src: string;
        alt: string | null;
        isDecorative: boolean;
        hasDimensions: boolean;
        loading: string | null;
      }[] = [];

      for (const img of imgNodes.slice(0, 100)) { // Inspect up to 100 images
        const alt = img.getAttribute("alt");
        const role = img.getAttribute("role");
        const isDecorative = alt === "" || role === "presentation" || role === "none";
        const hasDimensions =
          Boolean(img.getAttribute("width") && img.getAttribute("height")) ||
          (img.naturalWidth > 0 && img.naturalHeight > 0);
        const loading = img.getAttribute("loading");

        images.push({
          src: (img.src || img.getAttribute("src") || "").slice(0, 200),
          alt,
          isDecorative,
          hasDimensions,
          loading,
        });
      }

      // Links
      const aNodes = Array.from(document.querySelectorAll("a"));
      const links: {
        url: string;
        text: string;
        isInternal: boolean;
        hasHref: boolean;
      }[] = [];

      for (const a of aNodes.slice(0, 100)) {
        const rawHref = a.getAttribute("href");
        const href = a.href || "";
        const text = (a.textContent || a.getAttribute("aria-label") || "").trim();
        const hasHref = Boolean(rawHref && rawHref.trim() && rawHref !== "#");
        const isInternal = href.startsWith(window.location.origin) || (rawHref ? rawHref.startsWith("/") : false);

        links.push({
          url: href || rawHref || "",
          text,
          isInternal,
          hasHref,
        });
      }

      // Open Graph Tags
      const ogTags: Record<string, string> = {};
      const ogMetaNodes = Array.from(
        document.querySelectorAll('meta[property^="og:" i], meta[name^="og:" i]')
      );
      for (const m of ogMetaNodes) {
        const prop = (m.getAttribute("property") || m.getAttribute("name") || "").toLowerCase();
        const val = m.getAttribute("content") || "";
        if (prop) ogTags[prop] = val;
      }

      // Twitter Tags
      const twitterTags: Record<string, string> = {};
      const twMetaNodes = Array.from(
        document.querySelectorAll('meta[name^="twitter:" i], meta[property^="twitter:" i]')
      );
      for (const m of twMetaNodes) {
        const prop = (m.getAttribute("name") || m.getAttribute("property") || "").toLowerCase();
        const val = m.getAttribute("content") || "";
        if (prop) twitterTags[prop] = val;
      }

      // Structured Data
      const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const jsonLdItems: { type: string | null; validJson: boolean; rawPreview: string; error?: string }[] = [];

      for (const script of jsonLdScripts) {
        const content = (script.textContent || "").trim();
        try {
          const parsed = JSON.parse(content);
          let extractedType: string | null = null;
          if (Array.isArray(parsed)) {
            extractedType = parsed.map((item) => item?.["@type"]).filter(Boolean).join(", ");
          } else if (parsed && typeof parsed === "object") {
            extractedType = parsed["@type"] || null;
            if (!extractedType && Array.isArray(parsed["@graph"])) {
              extractedType = parsed["@graph"].map((g: any) => g?.["@type"]).filter(Boolean).join(", ");
            }
          }
          jsonLdItems.push({
            type: extractedType,
            validJson: true,
            rawPreview: content.slice(0, 300),
          });
        } catch (e: any) {
          jsonLdItems.push({
            type: null,
            validJson: false,
            rawPreview: content.slice(0, 300),
            error: e?.message || "Invalid JSON syntax",
          });
        }
      }

      const microdataDetected = document.querySelectorAll("[itemscope], [itemtype]").length > 0;
      const rdfaDetected = document.querySelectorAll("[vocab], [typeof]").length > 0;

      // Lang attribute
      const htmlLang = document.documentElement.getAttribute("lang");

      // Viewport meta
      const viewportMeta = document.querySelector('meta[name="viewport" i]');
      const viewportContent = viewportMeta ? viewportMeta.getAttribute("content") : null;

      // Mobile signals
      const hasResponsiveImages =
        document.querySelectorAll("img[srcset], picture source").length > 0;
      const contentWidthOverflowDetected =
        document.documentElement.scrollWidth > window.innerWidth;

      return {
        titleValue,
        metaDescValue,
        canonicalValue,
        hasMultipleCanonicals,
        robotsMetaRaw,
        h1Count: h1Nodes.length,
        h1Texts,
        h2Count,
        h3Count,
        h4Count,
        h5Count,
        h6Count,
        emptyHeadingsCount,
        hierarchyIssues,
        images,
        links,
        ogTags,
        twitterTags,
        jsonLdItems,
        microdataDetected,
        rdfaDetected,
        htmlLang,
        viewportContent,
        hasResponsiveImages,
        contentWidthOverflowDetected,
      };
    });

    // 4. External inspections: Robots.txt & Sitemap
    const pageUrlObj = new URL(finalUrl);
    const origin = pageUrlObj.origin;

    const robotsTxtResult = await fetchRobotsTxt(origin, pageUrlObj.pathname);
    const discoveredSitemapUrl =
      robotsTxtResult.sitemaps.length > 0 ? robotsTxtResult.sitemaps[0] : `${origin}/sitemap.xml`;
    const sitemapResult = await fetchAndCheckSitemap(discoveredSitemapUrl);

    // 5. Sample directly referenced links (up to 10) for HTTP reachability
    const checkedLinks = await sampleCheckLinks(domData.links, origin);

    // 6. Assemble Page Details
    const robotsDirectives = domData.robotsMetaRaw
      ? domData.robotsMetaRaw.toLowerCase().split(",").map((d) => d.trim()).filter(Boolean)
      : [];
    const isRobotsNoindex =
      robotsDirectives.includes("noindex") || xRobotsDirectives.includes("noindex");
    const isRobotsNofollow =
      robotsDirectives.includes("nofollow") || xRobotsDirectives.includes("nofollow");

    let isCanonicalAbsolute = false;
    let isCanonicalSelfReferential = false;
    if (domData.canonicalValue) {
      try {
        const canUrl = new URL(domData.canonicalValue, finalUrl);
        isCanonicalAbsolute = domData.canonicalValue.startsWith("http://") || domData.canonicalValue.startsWith("https://");
        isCanonicalSelfReferential = canUrl.href.replace(/\/$/, "") === finalUrl.replace(/\/$/, "");
      } catch {}
    }

    const totalImages = domData.images.length;
    const decorativeImages = domData.images.filter((img) => img.isDecorative).length;
    const withAltImages = domData.images.filter((img) => img.alt !== null && img.alt !== "").length;
    const missingAltImages = domData.images.filter((img) => img.alt === null).length;
    const lazyLoadedImages = domData.images.filter((img) => img.loading === "lazy").length;

    const totalLinks = domData.links.length;
    const internalLinks = domData.links.filter((l) => l.isInternal).length;
    const externalLinks = totalLinks - internalLinks;
    const missingHrefLinks = domData.links.filter((l) => !l.hasHref).length;
    const emptyTextLinks = domData.links.filter((l) => !l.text).length;

    // Indexability evaluation
    const indexabilityReasons: string[] = [];
    let isIndexable = true;

    if (httpStatus !== 200) {
      isIndexable = false;
      indexabilityReasons.push(`HTTP status is ${httpStatus} (expected 200 OK)`);
    }
    if (isRobotsNoindex) {
      isIndexable = false;
      indexabilityReasons.push(`Page explicitly requests 'noindex' in robots directives`);
    }
    if (robotsTxtResult.isPathDisallowed) {
      isIndexable = false;
      indexabilityReasons.push(`Target path matches a 'Disallow' directive in /robots.txt`);
    }
    if (!domData.canonicalValue) {
      indexabilityReasons.push(`Canonical URL tag is absent (search engines will infer canonical)`);
    }
    if (indexabilityReasons.length === 0) {
      indexabilityReasons.push("Technical indexability signals are favorable for search engine indexing.");
    }

    const pageDetails: SeoPageDetails = {
      title: {
        value: domData.titleValue,
        length: domData.titleValue ? domData.titleValue.length : 0,
      },
      metaDescription: {
        value: domData.metaDescValue,
        length: domData.metaDescValue ? domData.metaDescValue.length : 0,
      },
      canonical: {
        value: domData.canonicalValue,
        isSelfReferential: isCanonicalSelfReferential,
        isAbsolute: isCanonicalAbsolute,
        hasMultiple: domData.hasMultipleCanonicals,
      },
      robotsMeta: {
        raw: domData.robotsMetaRaw,
        directives: robotsDirectives,
        isNoindex: isRobotsNoindex,
        isNofollow: isRobotsNofollow,
      },
      xRobotsTag: {
        raw: xRobotsTagRaw,
        directives: xRobotsDirectives,
        isNoindex: xRobotsDirectives.includes("noindex"),
        isNofollow: xRobotsDirectives.includes("nofollow"),
      },
      headings: {
        h1Count: domData.h1Count,
        h1Texts: domData.h1Texts,
        h2Count: domData.h2Count,
        h3Count: domData.h3Count,
        h4Count: domData.h4Count,
        h5Count: domData.h5Count,
        h6Count: domData.h6Count,
        emptyHeadingsCount: domData.emptyHeadingsCount,
        hierarchyIssues: domData.hierarchyIssues,
      },
      images: {
        total: totalImages,
        withAlt: withAltImages,
        missingAlt: missingAltImages,
        decorative: decorativeImages,
        lazyLoaded: lazyLoadedImages,
        items: domData.images,
      },
      links: {
        total: totalLinks,
        internal: internalLinks,
        external: externalLinks,
        missingHref: missingHrefLinks,
        emptyText: emptyTextLinks,
        checkedLinks,
      },
      openGraph: {
        title: domData.ogTags["og:title"] || null,
        description: domData.ogTags["og:description"] || null,
        image: domData.ogTags["og:image"] || null,
        url: domData.ogTags["og:url"] || null,
        type: domData.ogTags["og:type"] || null,
        allTags: domData.ogTags,
      },
      twitter: {
        card: domData.twitterTags["twitter:card"] || null,
        title: domData.twitterTags["twitter:title"] || null,
        description: domData.twitterTags["twitter:description"] || null,
        image: domData.twitterTags["twitter:image"] || null,
        allTags: domData.twitterTags,
      },
      structuredData: {
        jsonLdDetected: domData.jsonLdItems.length > 0,
        jsonLdItems: domData.jsonLdItems,
        microdataDetected: domData.microdataDetected,
        rdfaDetected: domData.rdfaDetected,
      },
      htmlLang: domData.htmlLang,
      viewport: domData.viewportContent,
      mobileSignals: {
        hasViewportMeta: Boolean(domData.viewportContent),
        hasResponsiveImages: domData.hasResponsiveImages,
        contentWidthOverflowDetected: domData.contentWidthOverflowDetected,
      },
      robotsTxt: robotsTxtResult,
      sitemap: sitemapResult,
      indexability: {
        isIndexable,
        signals: {
          httpStatusOk: httpStatus === 200,
          noindexPresent: isRobotsNoindex,
          canonicalPresent: Boolean(domData.canonicalValue),
          robotsTxtAllowed: !robotsTxtResult.isPathDisallowed,
        },
        reasons: indexabilityReasons,
      },
    };

    // 7. Generate Factual Findings
    const findings: SeoFinding[] = generateSeoFindings(pageDetails, httpStatus, redirectChain, spec);

    // 8. Evaluate Assertions
    const assertions = evaluateSeoAssertions(pageDetails, httpStatus, redirectChain, spec.assertions);

    const anyAssertionFailed = assertions.some((a) => !a.passed);
    const overallStatus: "PASSED" | "FAILED" = anyAssertionFailed ? "FAILED" : "PASSED";

    // Summary counts
    const errorCount = findings.filter((f) => f.severity === "ERROR").length;
    const warningCount = findings.filter((f) => f.severity === "WARNING").length;
    const infoCount = findings.filter((f) => f.severity === "INFO").length;
    const passCount = findings.filter((f) => f.severity === "PASS").length;

    const durationMs = Date.now() - startTime;

    let errorSummary: string | undefined;
    if (anyAssertionFailed) {
      const failed = assertions.filter((a) => !a.passed);
      errorSummary = `${failed.length} SEO assertion(s) failed: ${failed.map((f) => f.description).join("; ")}`;
    }

    return {
      url: resolvedUrl,
      finalUrl,
      httpStatus,
      httpStatusText,
      redirectChain,
      durationMs,
      status: overallStatus,
      summary: {
        totalChecks: findings.length,
        errors: errorCount,
        warnings: warningCount,
        info: infoCount,
        passed: passCount,
      },
      findings,
      pageDetails,
      assertions,
      screenshotUrl,
      errorSummary,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return buildFailedResult(resolvedUrl, err?.message || "SEO audit runtime error", durationMs, spec);
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Generates factual findings organized into standard categories.
 */
function generateSeoFindings(
  details: SeoPageDetails,
  httpStatus: number,
  redirectChain: SeoRedirectStep[],
  spec: SeoTestSpec
): SeoFinding[] {
  const findings: SeoFinding[] = [];
  const checks = spec.checks || {};

  // 1. Technical SEO Checks
  if (checks.technical !== false) {
    // HTTP Status
    if (httpStatus === 200) {
      findings.push({
        id: "tech-http-status",
        category: "technical",
        severity: "PASS",
        status: "PASSED",
        title: "HTTP Status Code 200 OK",
        description: "The server responded with successful HTTP 200 status code.",
        actual: `HTTP ${httpStatus}`,
        expected: "HTTP 200",
        recommendation: "Ensure web servers return 200 OK for live public pages.",
      });
    } else {
      findings.push({
        id: "tech-http-status",
        category: "technical",
        severity: "ERROR",
        status: "FAILED",
        title: `Non-200 HTTP Status (${httpStatus})`,
        description: `The page returned HTTP status ${httpStatus}.`,
        actual: `HTTP ${httpStatus}`,
        expected: "HTTP 200",
        recommendation: "Investigate server configuration or route handlers to ensure page is accessible.",
      });
    }

    // Redirects
    if (redirectChain.length === 0) {
      findings.push({
        id: "tech-redirects",
        category: "technical",
        severity: "PASS",
        status: "PASSED",
        title: "Direct Navigation (No Redirects)",
        description: "Page loaded directly without intermediary redirects.",
        actual: "0 redirects",
        expected: "Direct response",
      });
    } else if (redirectChain.length <= 2) {
      findings.push({
        id: "tech-redirects",
        category: "technical",
        severity: "INFO",
        status: "INFO",
        title: `Redirect Encountered (${redirectChain.length} hop)`,
        description: `Page redirected through ${redirectChain.length} hop(s) to reach destination.`,
        actual: `${redirectChain.length} redirect(s)`,
        evidence: redirectChain.map((r) => `${r.status} ${r.url}`).join(" -> "),
        recommendation: "Keep redirect chains minimal to preserve crawl budget and avoid latency.",
      });
    } else {
      findings.push({
        id: "tech-redirects",
        category: "technical",
        severity: "WARNING",
        status: "WARNING",
        title: `Multi-Hop Redirect Chain (${redirectChain.length} hops)`,
        description: "Redirect chains with 3 or more hops can slow down page loading and crawling.",
        actual: `${redirectChain.length} redirects`,
        expected: "<= 2 redirects",
        evidence: redirectChain.map((r) => `${r.status} ${r.url}`).join(" -> "),
        recommendation: "Update internal links to point directly to the final destination URL.",
      });
    }

    // Canonical
    if (details.canonical.value) {
      if (details.canonical.hasMultiple) {
        findings.push({
          id: "tech-canonical-multiple",
          category: "technical",
          severity: "ERROR",
          status: "FAILED",
          title: "Multiple Canonical Tags Detected",
          description: "Declaring multiple conflicting canonical URLs confuses search crawlers.",
          actual: "Multiple <link rel='canonical'> tags present",
          expected: "Exactly one canonical tag per document",
          recommendation: "Ensure only a single canonical URL declaration exists in <head>.",
        });
      } else {
        findings.push({
          id: "tech-canonical",
          category: "technical",
          severity: "PASS",
          status: "PASSED",
          title: "Canonical URL Tag Present",
          description: "Canonical link specifies preferred URL representation.",
          actual: details.canonical.value,
          evidence: `<link rel="canonical" href="${details.canonical.value}">`,
          recommendation: "Maintain accurate canonical URLs to prevent duplicate content issues.",
        });
      }
    } else {
      findings.push({
        id: "tech-canonical-missing",
        category: "technical",
        severity: "WARNING",
        status: "WARNING",
        title: "Canonical URL Tag Missing",
        description: "No canonical link element was found in the page header.",
        actual: "None",
        expected: "<link rel='canonical' href='...'>",
        recommendation: "Add a canonical URL tag to declare the authoritative URL for this page.",
      });
    }

    // HTML Lang
    if (details.htmlLang) {
      findings.push({
        id: "tech-html-lang",
        category: "technical",
        severity: "PASS",
        status: "PASSED",
        title: `HTML Language Attribute Declared ("${details.htmlLang}")`,
        description: "The <html> element specifies a valid language identifier.",
        actual: details.htmlLang,
        evidence: `<html lang="${details.htmlLang}">`,
      });
    } else {
      findings.push({
        id: "tech-html-lang-missing",
        category: "technical",
        severity: "WARNING",
        status: "WARNING",
        title: "HTML Language Attribute Missing",
        description: "The <html> root element does not declare a lang attribute.",
        actual: "None",
        expected: "<html lang='en'>",
        recommendation: "Add a lang attribute to the <html> tag to specify the primary language.",
      });
    }
  }

  // 2. Metadata Checks
  if (checks.metadata !== false) {
    // Title
    if (details.title.value && details.title.value.trim().length > 0) {
      const len = details.title.length;
      if (len >= 20 && len <= 70) {
        findings.push({
          id: "meta-title",
          category: "metadata",
          severity: "PASS",
          status: "PASSED",
          title: `Page Title Found (${len} characters)`,
          description: "Title is present with standard length for search engine result snippets.",
          actual: details.title.value,
          expected: "20-70 characters",
          evidence: `<title>${details.title.value}</title>`,
        });
      } else {
        findings.push({
          id: "meta-title-length",
          category: "metadata",
          severity: "WARNING",
          status: "WARNING",
          title: `Page Title Length Notice (${len} characters)`,
          description:
            len < 20
              ? "Title may be too short to adequately describe the page."
              : "Title may be truncated in standard search engine result snippets (heuristic: ~50-65 chars).",
          actual: `"${details.title.value}" (${len} chars)`,
          expected: "20-65 characters recommended heuristic",
          evidence: `<title>${details.title.value}</title>`,
          recommendation: "Consider refining the title length to provide a descriptive snippet.",
        });
      }
    } else {
      findings.push({
        id: "meta-title-missing",
        category: "metadata",
        severity: "ERROR",
        status: "FAILED",
        title: "Page Title Missing or Empty",
        description: "The document lacks a valid, non-empty <title> tag.",
        actual: details.title.value || "None",
        expected: "A meaningful, non-empty <title> element",
        recommendation: "Add a descriptive <title> tag inside the <head> block.",
      });
    }

    // Meta Description
    if (details.metaDescription.value && details.metaDescription.value.trim().length > 0) {
      const len = details.metaDescription.length;
      if (len >= 50 && len <= 165) {
        findings.push({
          id: "meta-description",
          category: "metadata",
          severity: "PASS",
          status: "PASSED",
          title: `Meta Description Present (${len} characters)`,
          description: "Meta description provides a concise summary within common display thresholds.",
          actual: details.metaDescription.value,
          evidence: `<meta name="description" content="${details.metaDescription.value}">`,
        });
      } else {
        findings.push({
          id: "meta-description-length",
          category: "metadata",
          severity: "WARNING",
          status: "WARNING",
          title: `Meta Description Length Notice (${len} characters)`,
          description:
            len < 50
              ? "Meta description is quite brief and may not provide sufficient context in snippets."
              : "Meta description exceeds ~160 characters and may be truncated in search snippets.",
          actual: `Length: ${len} characters`,
          expected: "50-160 characters (heuristic guideline)",
          evidence: `<meta name="description" content="${details.metaDescription.value}">`,
          recommendation: "Evaluate description length against your target search snippet presentation.",
        });
      }
    } else {
      findings.push({
        id: "meta-description-missing",
        category: "metadata",
        severity: "WARNING",
        status: "WARNING",
        title: "Meta Description Missing",
        description: "No <meta name='description'> tag found in document head.",
        actual: "None",
        expected: "<meta name='description' content='...'>",
        recommendation: "Provide a concise meta description to assist search engines in snippet generation.",
      });
    }
  }

  // 3. Indexability Checks
  if (checks.indexability !== false) {
    if (details.robotsMeta.isNoindex || details.xRobotsTag.isNoindex) {
      findings.push({
        id: "index-noindex-detected",
        category: "indexability",
        severity: "WARNING",
        status: "WARNING",
        title: "Noindex Directive Detected",
        description: "The page signals search crawlers not to index this URL via meta robots or X-Robots-Tag.",
        actual: `Directives: ${[...details.robotsMeta.directives, ...details.xRobotsTag.directives].join(", ")}`,
        evidence: details.robotsMeta.raw
          ? `<meta name="robots" content="${details.robotsMeta.raw}">`
          : details.xRobotsTag.raw || "X-Robots-Tag header",
        recommendation:
          "If this page is intended for public search visibility, remove the 'noindex' directive.",
      });
    } else {
      findings.push({
        id: "index-indexable",
        category: "indexability",
        severity: "PASS",
        status: "PASSED",
        title: "No Blocking Index Directives Found",
        description: "No 'noindex' directives were found in meta tags or HTTP response headers.",
        actual: details.robotsMeta.raw || "index, follow (default)",
        recommendation: "Page is open to search engine indexing from a meta directive standpoint.",
      });
    }
  }

  // 4. Headings Checks
  if (checks.headings !== false) {
    if (details.headings.h1Count === 1) {
      findings.push({
        id: "heading-h1-single",
        category: "headings",
        severity: "PASS",
        status: "PASSED",
        title: "Single Main H1 Heading Detected",
        description: "Exactly one top-level H1 element was identified.",
        actual: `H1: "${details.headings.h1Texts[0] || ""}"`,
        evidence: `<h1>${details.headings.h1Texts[0] || ""}</h1>`,
      });
    } else if (details.headings.h1Count === 0) {
      findings.push({
        id: "heading-h1-missing",
        category: "headings",
        severity: "ERROR",
        status: "FAILED",
        title: "H1 Heading Missing",
        description: "The document lacks a top-level <h1> heading.",
        actual: "0 H1 elements",
        expected: "Exactly 1 H1 element",
        recommendation: "Add a main <h1> heading summarizing the primary topic of the page.",
      });
    } else {
      findings.push({
        id: "heading-h1-multiple",
        category: "headings",
        severity: "WARNING",
        status: "WARNING",
        title: `Multiple H1 Headings Detected (${details.headings.h1Count})`,
        description:
          "Found multiple H1 headings. While supported in modern HTML5, a single primary H1 provides clearest topic hierarchy.",
        actual: `${details.headings.h1Count} H1 elements`,
        expected: "1 primary H1 element",
        evidence: details.headings.h1Texts.map((t) => `<h1>${t}</h1>`).join(", "),
        recommendation: "Consider structuring sub-sections with H2 headings under a single primary H1.",
      });
    }

    if (details.headings.emptyHeadingsCount > 0) {
      findings.push({
        id: "heading-empty",
        category: "headings",
        severity: "WARNING",
        status: "WARNING",
        title: `Empty Headings Found (${details.headings.emptyHeadingsCount})`,
        description: "One or more heading tags (H1-H6) contain no readable text.",
        actual: `${details.headings.emptyHeadingsCount} empty heading(s)`,
        recommendation: "Ensure all headings contain accessible text or remove decorative empty tags.",
      });
    }
  }

  // 5. Images Checks
  if (checks.images !== false) {
    if (details.images.total === 0) {
      findings.push({
        id: "img-none",
        category: "images",
        severity: "INFO",
        status: "INFO",
        title: "No Image Elements Detected",
        description: "Document does not include any <img> elements.",
        actual: "0 images",
      });
    } else if (details.images.missingAlt === 0) {
      findings.push({
        id: "img-all-alt",
        category: "images",
        severity: "PASS",
        status: "PASSED",
        title: `All Images Have Alt Attributes (${details.images.total} images)`,
        description: `Every image has an alt attribute (${details.images.withAlt} descriptive, ${details.images.decorative} decorative).`,
        actual: `${details.images.total} images with valid alt attributes`,
      });
    } else {
      findings.push({
        id: "img-missing-alt",
        category: "images",
        severity: "WARNING",
        status: "WARNING",
        title: `Images Missing Alt Attributes (${details.images.missingAlt} of ${details.images.total})`,
        description: "Some image tags omit the required alt attribute entirely.",
        actual: `${details.images.missingAlt} image(s) missing alt`,
        expected: "All images specify alt attribute (or empty alt='' for decorative graphics)",
        recommendation: "Add descriptive alt attributes to content images or alt='' for decorative icons.",
      });
    }
  }

  // 6. Links Checks
  if (checks.links !== false) {
    if (details.links.missingHref > 0) {
      findings.push({
        id: "links-missing-href",
        category: "links",
        severity: "WARNING",
        status: "WARNING",
        title: `Anchor Tags Missing href (${details.links.missingHref})`,
        description: "Anchor elements (<a>) found without valid destination href attributes.",
        actual: `${details.links.missingHref} anchor(s) without href`,
        recommendation: "Ensure navigation anchors specify valid href targets.",
      });
    }

    if (details.links.emptyText > 0) {
      findings.push({
        id: "links-empty-text",
        category: "links",
        severity: "WARNING",
        status: "WARNING",
        title: `Links Without Descriptive Text (${details.links.emptyText})`,
        description: "Links found without inner text or aria-label accessible naming.",
        actual: `${details.links.emptyText} link(s) without text`,
        recommendation: "Provide meaningful link anchor text for accessibility and search context.",
      });
    }

    const brokenLinks = details.links.checkedLinks.filter((l) => !l.ok);
    if (brokenLinks.length > 0) {
      findings.push({
        id: "links-broken",
        category: "links",
        severity: "ERROR",
        status: "FAILED",
        title: `Broken Links Detected (${brokenLinks.length} failed)`,
        description: "Sampled internal or external hyperlinks returned HTTP error status codes.",
        actual: brokenLinks.map((b) => `${b.url} (${b.status || b.error})`).join(", "),
        expected: "All hyperlinks return successful 2xx/3xx response",
        recommendation: "Fix or remove broken link destinations to prevent crawl errors.",
      });
    }
  }

  // 7. Social Metadata Checks
  if (checks.social !== false) {
    const og = details.openGraph;
    if (og.title && og.image) {
      findings.push({
        id: "social-og-present",
        category: "social",
        severity: "PASS",
        status: "PASSED",
        title: "Open Graph Social Metadata Detected",
        description: "Essential Open Graph tags (og:title, og:image) are present for rich link previews.",
        actual: `og:title="${og.title}", og:image="${og.image}"`,
      });
    } else {
      findings.push({
        id: "social-og-partial",
        category: "social",
        severity: "INFO",
        status: "INFO",
        title: "Open Graph Tags Incomplete",
        description: "Some recommended Open Graph tags (og:title, og:description, og:image) are missing.",
        actual: og.title ? `Title present, missing: ${!og.image ? "og:image" : ""}` : "og:title not found",
        recommendation: "Configure og:title, og:description, and og:image for rich social sharing cards.",
      });
    }

    const tw = details.twitter;
    if (tw.card) {
      findings.push({
        id: "social-twitter-card",
        category: "social",
        severity: "PASS",
        status: "PASSED",
        title: `Twitter Card Metadata Detected (${tw.card})`,
        description: "Twitter card meta tags configured for X/Twitter sharing.",
        actual: `twitter:card="${tw.card}"`,
      });
    }
  }

  // 8. Structured Data Checks
  if (checks.structuredData !== false) {
    const sd = details.structuredData;
    if (sd.jsonLdDetected) {
      const invalidItems = sd.jsonLdItems.filter((i) => !i.validJson);
      if (invalidItems.length > 0) {
        findings.push({
          id: "sd-jsonld-invalid",
          category: "structured_data",
          severity: "ERROR",
          status: "FAILED",
          title: "Malformed JSON-LD Structured Data",
          description: "A JSON-LD script block contains syntax errors and cannot be parsed.",
          actual: invalidItems[0].error || "Syntax error",
          evidence: invalidItems[0].rawPreview,
          recommendation: "Validate JSON syntax in script[type='application/ld+json'] blocks.",
        });
      } else {
        const types = sd.jsonLdItems.map((i) => i.type).filter(Boolean).join(", ");
        findings.push({
          id: "sd-jsonld-valid",
          category: "structured_data",
          severity: "PASS",
          status: "PASSED",
          title: `JSON-LD Structured Data Detected (${types || "Schema detected"})`,
          description: "Valid JSON-LD schema blocks found.",
          actual: `Detected types: ${types || "Generic schema"}`,
        });
      }
    } else if (sd.microdataDetected || sd.rdfaDetected) {
      findings.push({
        id: "sd-microdata",
        category: "structured_data",
        severity: "PASS",
        status: "PASSED",
        title: "Microdata or RDFa Structured Data Detected",
        description: "In-line semantic markup detected in HTML elements.",
        actual: "Microdata/RDFa attributes found",
      });
    } else {
      findings.push({
        id: "sd-none",
        category: "structured_data",
        severity: "INFO",
        status: "INFO",
        title: "No Structured Data Detected",
        description: "No JSON-LD, Microdata, or RDFa structured markup was identified.",
        actual: "None",
        recommendation: "Consider adding JSON-LD schemas (Organization, Article, WebSite) for rich search features.",
      });
    }
  }

  // 9. Robots.txt Checks
  if (checks.robotsTxt !== false) {
    const rob = details.robotsTxt;
    if (rob.fetched && rob.status === 200) {
      findings.push({
        id: "robots-txt-available",
        category: "indexability",
        severity: "PASS",
        status: "PASSED",
        title: "Robots.txt File Available (200 OK)",
        description: "Host /robots.txt exists and is accessible.",
        actual: `Found ${rob.sitemaps.length} sitemap(s), ${rob.disallows.length} disallow rules`,
        evidence: rob.url,
      });

      if (rob.isPathDisallowed) {
        findings.push({
          id: "robots-txt-disallowed",
          category: "indexability",
          severity: "WARNING",
          status: "WARNING",
          title: "Target Path Blocked in Robots.txt",
          description: "Target URL matches a Disallow directive in /robots.txt.",
          actual: `Blocked by rule: ${rob.relevantRule || "Disallow"}`,
          evidence: rob.relevantRule || "",
          recommendation: "Ensure robots.txt disallow rules align with your intended indexing goals.",
        });
      }
    } else {
      findings.push({
        id: "robots-txt-missing",
        category: "indexability",
        severity: "INFO",
        status: "INFO",
        title: "Robots.txt Not Found or Inaccessible",
        description: `HTTP status ${rob.status || "unreachable"} for /robots.txt. Search engines assume full site crawlability by default.`,
        actual: `Status: ${rob.status || "Failed"}`,
      });
    }
  }

  // 10. Sitemap Checks
  if (checks.sitemap !== false) {
    const sm = details.sitemap;
    if (sm.accessible && sm.validXml) {
      findings.push({
        id: "sitemap-valid",
        category: "technical",
        severity: "PASS",
        status: "PASSED",
        title: `XML Sitemap Accessible (${sm.urlCount} URLs detected)`,
        description: "Sitemap referenced by site is available with valid XML structure.",
        actual: `URL count: ${sm.urlCount}`,
        evidence: sm.discoveredUrl || "",
      });
    } else if (sm.discoveredUrl) {
      findings.push({
        id: "sitemap-inaccessible",
        category: "technical",
        severity: "INFO",
        status: "INFO",
        title: "Sitemap Inaccessible or Invalid XML",
        description: `Discovered sitemap (${sm.discoveredUrl}) returned status ${sm.status || "error"}.`,
        actual: sm.error || `Status ${sm.status}`,
      });
    }
  }

  // 11. Mobile Checks
  if (checks.mobile !== false) {
    if (details.mobileSignals.hasViewportMeta) {
      findings.push({
        id: "mobile-viewport",
        category: "mobile",
        severity: "PASS",
        status: "PASSED",
        title: "Mobile Viewport Meta Tag Configured",
        description: "Page defines a viewport meta tag for mobile device responsiveness.",
        actual: details.viewport || "width=device-width",
        evidence: `<meta name="viewport" content="${details.viewport}">`,
      });
    } else {
      findings.push({
        id: "mobile-viewport-missing",
        category: "mobile",
        severity: "ERROR",
        status: "FAILED",
        title: "Mobile Viewport Meta Tag Missing",
        description: "Without a viewport meta tag, mobile browsers render desktop viewports.",
        actual: "None",
        expected: "<meta name='viewport' content='width=device-width, initial-scale=1'>",
        recommendation: "Add a viewport meta tag to support mobile rendering.",
      });
    }
  }

  return findings;
}

/**
 * Evaluates configured assertions deterministically.
 */
function evaluateSeoAssertions(
  details: SeoPageDetails,
  httpStatus: number,
  redirectChain: SeoRedirectStep[],
  assertionsConfig?: SeoTestSpec["assertions"]
): SeoAssertionResult[] {
  const assertions: SeoAssertionResult[] = [];
  const cfg = assertionsConfig || {};

  // 1. Expected HTTP Status (default 200)
  const expectedStatus = cfg.expectedStatusCode !== undefined ? cfg.expectedStatusCode : 200;
  assertions.push({
    id: "assert-http-status",
    description: `HTTP status must equal ${expectedStatus}`,
    passed: httpStatus === expectedStatus,
    actual: `HTTP ${httpStatus}`,
    expected: `HTTP ${expectedStatus}`,
    errorMessage:
      httpStatus !== expectedStatus
        ? `Expected HTTP status ${expectedStatus} but received ${httpStatus}.`
        : undefined,
  });

  // 2. Title required (default true)
  if (cfg.titleRequired !== false) {
    const hasTitle = Boolean(details.title.value && details.title.value.trim().length > 0);
    assertions.push({
      id: "assert-title-required",
      description: "Page <title> is required and non-empty",
      passed: hasTitle,
      actual: hasTitle ? `"${details.title.value}"` : "Missing / empty",
      expected: "Non-empty string",
      errorMessage: !hasTitle ? "Page lacks a non-empty <title> tag." : undefined,
    });
  }

  // 3. Meta description required (default true)
  if (cfg.metaDescriptionRequired !== false) {
    const hasDesc = Boolean(
      details.metaDescription.value && details.metaDescription.value.trim().length > 0
    );
    assertions.push({
      id: "assert-description-required",
      description: "Meta description is required and non-empty",
      passed: hasDesc,
      actual: hasDesc ? `"${details.metaDescription.value}"` : "Missing / empty",
      expected: "Non-empty string",
      errorMessage: !hasDesc ? "Page lacks a non-empty <meta name='description'> tag." : undefined,
    });
  }

  // 4. Canonical required (default true)
  if (cfg.canonicalRequired !== false) {
    const hasCanonical = Boolean(details.canonical.value && details.canonical.value.trim().length > 0);
    assertions.push({
      id: "assert-canonical-required",
      description: "Canonical URL tag <link rel='canonical'> is required",
      passed: hasCanonical && !details.canonical.hasMultiple,
      actual: hasCanonical ? details.canonical.value! : "Missing",
      expected: "Single valid canonical link element",
      errorMessage: !hasCanonical
        ? "Page lacks a <link rel='canonical'> tag."
        : details.canonical.hasMultiple
        ? "Multiple conflicting canonical links declared."
        : undefined,
    });
  }

  // 5. H1 required (default true)
  if (cfg.h1Required !== false) {
    const hasH1 = details.headings.h1Count >= 1;
    assertions.push({
      id: "assert-h1-required",
      description: "At least one <h1> heading is required",
      passed: hasH1,
      actual: `${details.headings.h1Count} H1 heading(s)`,
      expected: ">= 1 H1 element",
      errorMessage: !hasH1 ? "Page does not contain any <h1> heading element." : undefined,
    });
  }

  // 6. Noindex disallowed (default false)
  if (cfg.noindexDisallowed === true) {
    const hasNoindex = details.robotsMeta.isNoindex || details.xRobotsTag.isNoindex;
    assertions.push({
      id: "assert-noindex-disallowed",
      description: "Page must not contain 'noindex' directives",
      passed: !hasNoindex,
      actual: hasNoindex ? "noindex detected" : "Indexable",
      expected: "No noindex directives",
      errorMessage: hasNoindex ? "Page contains 'noindex' directive blocking search indexing." : undefined,
    });
  }

  // 7. Structured data required (default false)
  if (cfg.structuredDataRequired === true) {
    const hasSd =
      details.structuredData.jsonLdDetected ||
      details.structuredData.microdataDetected ||
      details.structuredData.rdfaDetected;
    const hasValidSd =
      hasSd && !details.structuredData.jsonLdItems.some((i) => !i.validJson);
    assertions.push({
      id: "assert-structured-data-required",
      description: "Valid structured data (JSON-LD, Microdata, or RDFa) is required",
      passed: hasValidSd,
      actual: hasValidSd ? "Structured data detected and valid" : "Missing or malformed",
      expected: "Valid structured schema",
      errorMessage: !hasValidSd ? "Page does not contain valid structured data." : undefined,
    });
  }

  // 8. Max redirects (optional)
  if (typeof cfg.maxRedirects === "number") {
    const count = redirectChain.length;
    assertions.push({
      id: "assert-max-redirects",
      description: `Redirect hops must not exceed ${cfg.maxRedirects}`,
      passed: count <= cfg.maxRedirects,
      actual: `${count} redirect(s)`,
      expected: `<= ${cfg.maxRedirects}`,
      errorMessage:
        count > cfg.maxRedirects
          ? `Redirect chain has ${count} hops (maximum allowed is ${cfg.maxRedirects}).`
          : undefined,
    });
  }

  // 9. No broken links (default false)
  if (cfg.noBrokenLinks === true) {
    const broken = details.links.checkedLinks.filter((l) => !l.ok);
    assertions.push({
      id: "assert-no-broken-links",
      description: "Directly referenced hyperlinks must return successful HTTP status",
      passed: broken.length === 0,
      actual: broken.length === 0 ? "All checked links OK" : `${broken.length} broken link(s)`,
      expected: "0 broken links",
      errorMessage:
        broken.length > 0
          ? `Found ${broken.length} broken link(s): ${broken.map((b) => b.url).join(", ")}`
          : undefined,
    });
  }

  return assertions;
}

/**
 * Fetches and parses host /robots.txt with strict size and timeout limits.
 */
async function fetchRobotsTxt(origin: string, targetPath: string): Promise<SeoPageDetails["robotsTxt"]> {
  const robotsUrl = `${origin}/robots.txt`;
  try {
    checkUrlSecurity(robotsUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(robotsUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "OmniTest-Bot/1.0" },
    });
    clearTimeout(timer);

    if (!res.ok) {
      return {
        url: robotsUrl,
        fetched: true,
        status: res.status,
        sitemaps: [],
        disallows: [],
        relevantRule: null,
        isPathDisallowed: false,
      };
    }

    const text = await res.text();
    // Enforce 256KB max size
    const safeText = text.slice(0, 256 * 1024);

    const lines = safeText.split("\n").map((l) => l.trim());
    const sitemaps: string[] = [];
    const disallows: string[] = [];
    let isAppliesToAll = false;
    let relevantRule: string | null = null;
    let isPathDisallowed = false;

    for (const rawLine of lines) {
      const line = rawLine.replace(/#.*$/, "").trim(); // Strip comments
      if (!line) continue;

      const lower = line.toLowerCase();
      if (lower.startsWith("user-agent:")) {
        const agent = line.slice(11).trim();
        isAppliesToAll = agent === "*";
      } else if (lower.startsWith("sitemap:")) {
        const sm = line.slice(8).trim();
        if (sm) sitemaps.push(sm);
      } else if (lower.startsWith("disallow:") && isAppliesToAll) {
        const rule = line.slice(9).trim();
        if (rule) {
          disallows.push(rule);
          if (rule !== "/" && targetPath.startsWith(rule)) {
            isPathDisallowed = true;
            relevantRule = line;
          } else if (rule === "/" && targetPath) {
            isPathDisallowed = true;
            relevantRule = line;
          }
        }
      }
    }

    return {
      url: robotsUrl,
      fetched: true,
      status: res.status,
      sitemaps,
      disallows,
      relevantRule,
      isPathDisallowed,
    };
  } catch (err: any) {
    return {
      url: robotsUrl,
      fetched: false,
      status: null,
      sitemaps: [],
      disallows: [],
      relevantRule: null,
      isPathDisallowed: false,
      error: err?.message || "Failed to reach robots.txt",
    };
  }
}

/**
 * Checks discovered sitemap with size and XXE safety limits.
 */
async function fetchAndCheckSitemap(sitemapUrl: string): Promise<SeoPageDetails["sitemap"]> {
  try {
    checkUrlSecurity(sitemapUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(sitemapUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "OmniTest-Bot/1.0" },
    });
    clearTimeout(timer);

    if (!res.ok) {
      return {
        discoveredUrl: sitemapUrl,
        status: res.status,
        accessible: false,
        validXml: false,
        urlCount: 0,
      };
    }

    const text = await res.text();
    // Guard against oversized XML
    const safeText = text.slice(0, 512 * 1024);

    const isXml = safeText.includes("<?xml") || safeText.includes("<urlset") || safeText.includes("<sitemapindex");
    if (!isXml) {
      return {
        discoveredUrl: sitemapUrl,
        status: res.status,
        accessible: true,
        validXml: false,
        urlCount: 0,
        error: "Content does not appear to be standard XML sitemap",
      };
    }

    // Fast, safe regex counting of <loc> elements without DOMParser / libxml vulnerability
    const locMatches = safeText.match(/<loc>/gi);
    const urlCount = locMatches ? locMatches.length : 0;

    return {
      discoveredUrl: sitemapUrl,
      status: res.status,
      accessible: true,
      validXml: true,
      urlCount,
    };
  } catch (err: any) {
    return {
      discoveredUrl: sitemapUrl,
      status: null,
      accessible: false,
      validXml: false,
      urlCount: 0,
      error: err?.message || "Failed to fetch sitemap",
    };
  }
}

/**
 * Samples up to 10 directly referenced links for HTTP status checks.
 */
async function sampleCheckLinks(
  links: { url: string; text: string; isInternal: boolean; hasHref: boolean }[],
  origin: string
): Promise<SeoLinkItem[]> {
  const validLinks = links
    .filter((l) => l.hasHref && l.url.startsWith("http"))
    .slice(0, 10);

  const results: SeoLinkItem[] = [];

  for (const l of validLinks) {
    try {
      checkUrlSecurity(l.url);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(l.url, {
        method: "HEAD",
        signal: controller.signal,
        headers: { "User-Agent": "OmniTest-Bot/1.0" },
      }).catch(async () => {
        // Fallback to GET if HEAD rejected
        return fetch(l.url, {
          method: "GET",
          signal: controller.signal,
          headers: { "User-Agent": "OmniTest-Bot/1.0" },
        });
      });
      clearTimeout(timer);

      const ok = res.status < 400;
      results.push({
        url: l.url,
        text: l.text,
        status: res.status,
        isInternal: l.isInternal,
        ok,
      });
    } catch (err: any) {
      results.push({
        url: l.url,
        text: l.text,
        status: null,
        isInternal: l.isInternal,
        ok: false,
        error: err?.message || "Connection failed",
      });
    }
  }

  return results;
}

/**
 * Builds a fallback failure result when navigation or runtime fails.
 */
function buildFailedResult(
  url: string,
  errorMsg: string,
  durationMs: number,
  spec: SeoTestSpec
): SeoExecutionResult {
  return {
    url,
    finalUrl: url,
    httpStatus: 0,
    httpStatusText: "Failed",
    redirectChain: [],
    durationMs,
    status: "FAILED",
    summary: {
      totalChecks: 1,
      errors: 1,
      warnings: 0,
      info: 0,
      passed: 0,
    },
    findings: [
      {
        id: "runtime-failure",
        category: "technical",
        severity: "ERROR",
        status: "FAILED",
        title: "Navigation or Execution Failure",
        description: errorMsg,
        actual: errorMsg,
        recommendation: "Verify that the target URL is accessible and responds within timeout limits.",
      },
    ],
    pageDetails: {
      title: { value: null, length: 0 },
      metaDescription: { value: null, length: 0 },
      canonical: { value: null, isSelfReferential: false, isAbsolute: false, hasMultiple: false },
      robotsMeta: { raw: null, directives: [], isNoindex: false, isNofollow: false },
      xRobotsTag: { raw: null, directives: [], isNoindex: false, isNofollow: false },
      headings: {
        h1Count: 0,
        h1Texts: [],
        h2Count: 0,
        h3Count: 0,
        h4Count: 0,
        h5Count: 0,
        h6Count: 0,
        emptyHeadingsCount: 0,
        hierarchyIssues: [],
      },
      images: { total: 0, withAlt: 0, missingAlt: 0, decorative: 0, lazyLoaded: 0, items: [] },
      links: { total: 0, internal: 0, external: 0, missingHref: 0, emptyText: 0, checkedLinks: [] },
      openGraph: { title: null, description: null, image: null, url: null, type: null, allTags: {} },
      twitter: { card: null, title: null, description: null, image: null, allTags: {} },
      structuredData: { jsonLdDetected: false, jsonLdItems: [], microdataDetected: false, rdfaDetected: false },
      htmlLang: null,
      viewport: null,
      mobileSignals: { hasViewportMeta: false, hasResponsiveImages: false, contentWidthOverflowDetected: false },
      robotsTxt: { url: "", fetched: false, status: null, sitemaps: [], disallows: [], relevantRule: null, isPathDisallowed: false },
      sitemap: { discoveredUrl: null, status: null, accessible: false, validXml: false, urlCount: 0 },
      indexability: { isIndexable: false, signals: { httpStatusOk: false, noindexPresent: false, canonicalPresent: false, robotsTxtAllowed: false }, reasons: [errorMsg] },
    },
    assertions: [
      {
        id: "assert-runtime",
        description: "Page execution succeeded",
        passed: false,
        actual: "Failed",
        expected: "Success",
        errorMessage: errorMsg,
      },
    ],
    errorSummary: errorMsg,
  };
}
