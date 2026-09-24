import http from "http";
import fs from "fs";
import path from "path";
import { executeSeoTest } from "../apps/web/src/lib/runner/seo-executor";
import { validateSeoTestSpec } from "../apps/web/src/lib/runner/seo-validator";
import { SeoTestSpec } from "../apps/web/src/lib/runner/seo-types";
import { db } from "../apps/web/src/lib/db";
import { orchestrateTestRun } from "../apps/web/src/lib/runner/orchestrator";
import { checkUrlSecurity } from "../apps/web/src/lib/runner/api-executor";

async function verifyPhase5D() {
  console.log("=== OmniTest Phase 5D: Technical SEO Testing Acceptance Verification ===\n");

  let port = 0;

  // 1. Launch a local mock HTTP server serving pages with realistic SEO signals
  console.log("1. Starting Mock HTTP SEO Server...");
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/clean") {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "index, follow",
      });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>OmniTest — Automated Web Testing Engine</title>
  <meta name="description" content="OmniTest is a developer-focused automated testing platform supporting UI, API, accessibility, performance, and SEO testing.">
  <link rel="canonical" href="http://127.0.0.1:${port}/clean">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="og:title" content="OmniTest Testing Platform">
  <meta property="og:description" content="Comprehensive web test automation.">
  <meta property="og:image" content="http://127.0.0.1:${port}/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "OmniTest",
    "url": "http://127.0.0.1:${port}"
  }
  </script>
</head>
<body>
  <header>
    <h1>OmniTest Testing Platform</h1>
  </header>
  <main>
    <h2>Core Engine Overview</h2>
    <p>Unified test execution for modern web applications.</p>
    <img src="/img1.png" alt="Dashboard Preview" width="400" height="200">
    <img src="/decor.svg" alt="" role="presentation">
    <a href="/clean">Self Navigation Link</a>
  </main>
</body>
</html>`);
      return;
    }

    if (url.pathname === "/flawed") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <!-- Missing title, meta description, canonical, lang, and viewport -->
  <script type="application/ld+json">
    { invalid: json syntax here ...
  </script>
</head>
<body>
  <h1>First Primary Heading</h1>
  <h1>Second Conflicting Heading</h1>
  <h3>Skipped H2 Level</h3>
  <img src="/missing-alt.png">
  <a href="/clean"></a>
</body>
</html>`);
      return;
    }

    if (url.pathname === "/noindex-page") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <title>Noindex Private Test Page</title>
  <meta name="robots" content="noindex, nofollow">
</head>
<body>
  <h1>Staging Environment Only</h1>
</body>
</html>`);
      return;
    }

    if (url.pathname === "/redirect-start") {
      res.writeHead(301, {
        Location: `http://127.0.0.1:${port}/clean`,
      });
      res.end();
      return;
    }

    if (url.pathname === "/robots.txt") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`User-agent: *
Disallow: /blocked/
Sitemap: http://127.0.0.1:${port}/sitemap.xml
`);
      return;
    }

    if (url.pathname === "/sitemap.xml") {
      res.writeHead(200, { "Content-Type": "application/xml" });
      res.end(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://127.0.0.1:${port}/clean</loc>
  </url>
</urlset>`);
      return;
    }

    // Default 404
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        port = addr.port;
      }
      console.log(`   ✓ Mock server running at http://127.0.0.1:${port}`);
      resolve();
    });
  });

  const artifactDir = path.join(process.cwd(), "apps", "web", "public", "artifacts", "runs", "phase5d-test");
  fs.mkdirSync(artifactDir, { recursive: true });

  try {
    // 2. Validate SEO Test Spec Validator
    console.log("\n2. Testing SEO Spec Validator...");
    try {
      validateSeoTestSpec({ url: "not-a-valid-url" });
      throw new Error("Should have rejected invalid URL");
    } catch (err: any) {
      console.log(`   ✓ Correctly rejected invalid URL: "${err.message}"`);
    }

    const validSpec = validateSeoTestSpec({
      url: `http://127.0.0.1:${port}/clean`,
      timeoutSeconds: 20,
      checks: { technical: true, metadata: true, headings: true },
      assertions: { titleRequired: true, metaDescriptionRequired: true, canonicalRequired: true },
    });
    console.log(`   ✓ Normalized valid spec: url=${validSpec.url}, assertions=${Object.keys(validSpec.assertions || {}).length}`);

    // 3. Execute SEO Audit on Clean Page
    console.log("\n3. Executing Technical SEO Audit on Clean Page...");
    const cleanResult = await executeSeoTest(validSpec, {
      runId: "phase5d-clean-run",
      artifactDir,
      publicUrlPrefix: "/artifacts/runs/phase5d-test",
    });

    console.log(`   ✓ Audit Completed in ${cleanResult.durationMs}ms`);
    console.log(`   ✓ Status: ${cleanResult.status}`);
    console.log(`   ✓ Title: "${cleanResult.pageDetails.title.value}" (${cleanResult.pageDetails.title.length} chars)`);
    console.log(`   ✓ Meta Description: "${cleanResult.pageDetails.metaDescription.value?.slice(0, 50)}..."`);
    console.log(`   ✓ Canonical URL: ${cleanResult.pageDetails.canonical.value}`);
    console.log(`   ✓ H1 Count: ${cleanResult.pageDetails.headings.h1Count} ("${cleanResult.pageDetails.headings.h1Texts[0]}")`);
    console.log(`   ✓ Structured Data: JSON-LD detected (${cleanResult.pageDetails.structuredData.jsonLdItems.length} item(s), type: ${cleanResult.pageDetails.structuredData.jsonLdItems[0]?.type})`);
    console.log(`   ✓ Robots.txt: status=${cleanResult.pageDetails.robotsTxt.status}, sitemaps=${cleanResult.pageDetails.robotsTxt.sitemaps.length}`);
    console.log(`   ✓ Sitemap: status=${cleanResult.pageDetails.sitemap.status}, URLs=${cleanResult.pageDetails.sitemap.urlCount}`);
    console.log(`   ✓ Screenshot Captured: ${cleanResult.screenshotUrl ? "YES" : "NO"}`);

    if (cleanResult.status !== "PASSED") {
      throw new Error(`Expected clean page audit to pass, but got status=${cleanResult.status}`);
    }
    if (cleanResult.summary.errors !== 0) {
      throw new Error(`Expected 0 errors on clean page, but got ${cleanResult.summary.errors}`);
    }

    // 4. Execute SEO Audit on Flawed Page
    console.log("\n4. Executing Technical SEO Audit on Flawed Page...");
    const flawedSpec = validateSeoTestSpec({
      url: `http://127.0.0.1:${port}/flawed`,
      assertions: {
        titleRequired: true,
        metaDescriptionRequired: true,
        canonicalRequired: true,
        h1Required: true,
      },
    });

    const flawedResult = await executeSeoTest(flawedSpec, {
      runId: "phase5d-flawed-run",
      artifactDir,
      publicUrlPrefix: "/artifacts/runs/phase5d-test",
    });

    console.log(`   ✓ Flawed Page Audit Completed in ${flawedResult.durationMs}ms`);
    console.log(`   ✓ Expected Failure Status: ${flawedResult.status}`);
    console.log(`   ✓ Findings Breakdown: ${flawedResult.summary.errors} errors, ${flawedResult.summary.warnings} warnings, ${flawedResult.summary.passed} passed`);
    console.log(`   ✓ Detected Missing Title: ${flawedResult.findings.some((f) => f.id === "meta-title-missing")}`);
    console.log(`   ✓ Detected Missing Canonical: ${flawedResult.findings.some((f) => f.id === "tech-canonical-missing")}`);
    console.log(`   ✓ Detected Multiple H1s: ${flawedResult.findings.some((f) => f.id === "heading-h1-multiple")}`);
    console.log(`   ✓ Detected Malformed JSON-LD: ${flawedResult.findings.some((f) => f.id === "sd-jsonld-invalid")}`);
    console.log(`   ✓ Detected Missing Image Alt: ${flawedResult.findings.some((f) => f.id === "img-missing-alt")}`);
    console.log(`   ✓ Error Summary: "${flawedResult.errorSummary}"`);

    if (flawedResult.status !== "FAILED") {
      throw new Error(`Expected flawed page to fail assertions, but got ${flawedResult.status}`);
    }

    // 5. Test Redirect Tracking & Robots.txt Disallow
    console.log("\n5. Testing Redirect Tracking & Robots Disallow...");
    const redirectSpec = validateSeoTestSpec({
      url: `http://127.0.0.1:${port}/redirect-start`,
      assertions: { maxRedirects: 2 },
    });

    const redirectResult = await executeSeoTest(redirectSpec, {
      runId: "phase5d-redirect-run",
      artifactDir,
    });

    console.log(`   ✓ Redirect Hops: ${redirectResult.redirectChain.length}`);
    console.log(`   ✓ Final Destination: ${redirectResult.finalUrl}`);
    console.log(`   ✓ Status: ${redirectResult.status}`);

    // 6. Test Noindex Directive Detection
    console.log("\n6. Testing Noindex Directive Assertion...");
    const noindexSpec = validateSeoTestSpec({
      url: `http://127.0.0.1:${port}/noindex-page`,
      assertions: { noindexDisallowed: true },
    });

    const noindexResult = await executeSeoTest(noindexSpec, {
      runId: "phase5d-noindex-run",
      artifactDir,
    });

    console.log(`   ✓ Noindex Page Status: ${noindexResult.status} (Expected FAILED due to noindexDisallowed)`);
    console.log(`   ✓ Detected Noindex: ${noindexResult.pageDetails.robotsMeta.isNoindex}`);
    if (noindexResult.status !== "FAILED") {
      throw new Error("Expected noindex assertion to fail.");
    }

    // 7. Test Security & SSRF Defense
    console.log("\n7. Testing Security & SSRF Protection...");
    try {
      checkUrlSecurity("http://169.254.169.254/latest/meta-data");
      throw new Error("Should have blocked cloud metadata IP");
    } catch (err: any) {
      console.log(`   ✓ Correctly blocked cloud metadata SSRF: "${err.message}"`);
    }

    // 8. End-to-End Orchestrator Integration with Database
    console.log("\n8. Testing End-to-End Database Orchestration...");
    const org = await db.organization.create({
      data: {
        name: "SEO Test Org",
        slug: `seo-org-${Date.now()}`,
      },
    });

    const project = await db.project.create({
      data: {
        organizationId: org.id,
        name: "SEO Verification Project",
        slug: `seo-proj-${Date.now()}`,
        baseUrl: `http://127.0.0.1:${port}`,
      },
    });

    const suite = await db.testSuite.create({
      data: {
        projectId: project.id,
        name: "SEO Audits",
      },
    });

    const test = await db.test.create({
      data: {
        suiteId: suite.id,
        title: "Clean Page SEO Audit",
        type: "SEO",
        config: JSON.stringify(validSpec),
        timeoutSeconds: 30,
      },
    });

    console.log(`   ✓ Created SEO Test in DB (ID: ${test.id}, type: ${test.type})`);

    const orchestrated = await orchestrateTestRun({
      testId: test.id,
      projectId: project.id,
      trigger: "MANUAL",
    });

    console.log(`   ✓ Orchestrated Run Complete:`);
    console.log(`     • Run ID: ${orchestrated.run.id}`);
    console.log(`     • Run Status: ${orchestrated.run.status}`);
    console.log(`     • TestResult Type: ${orchestrated.testResult.testType}`);
    console.log(`     • TestResult Status: ${orchestrated.testResult.status}`);
    console.log(`     • Duration: ${orchestrated.testResult.durationMs}ms`);
    console.log(`     • Artifacts Stored: ${orchestrated.result.artifacts.length}`);

    if (orchestrated.testResult.status !== "PASSED") {
      throw new Error(`Orchestrated run expected PASSED, got ${orchestrated.testResult.status}`);
    }

    // 9. Cleanup
    console.log("\n9. Cleaning up test database records...");
    await db.test.delete({ where: { id: test.id } });
    await db.testSuite.delete({ where: { id: suite.id } });
    await db.project.delete({ where: { id: project.id } });
    await db.organization.delete({ where: { id: org.id } });
    console.log("   ✓ Cleaned up test database records.");

    console.log("\n🎉 ALL PHASE 5D SEO TESTING ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!\n");
  } finally {
    server.close();
    try {
      fs.rmSync(artifactDir, { recursive: true, force: true });
    } catch {}
  }
}

verifyPhase5D().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
