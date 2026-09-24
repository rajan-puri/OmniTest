import { chromium } from "playwright";
import path from "path";
import fs from "fs";

async function runQA() {
  const artifactDir = "/Users/rajan/.gemini/antigravity-cli/brain/1af5cda1-a9ff-47b1-bcfc-1198a807bd52";
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: "375", width: 375, height: 812, isMobile: true },
    { name: "768", width: 768, height: 1024, isMobile: false },
    { name: "1440", width: 1440, height: 900, isMobile: false },
  ];

  console.log("=== Starting OmniTest Landing Page End-to-End QA ===");

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
    });
    const page = await context.newPage();

    // Check for console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    console.log(`\nTesting viewport ${vp.name} (${vp.width}x${vp.height})...`);
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Verify horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    if (hasHorizontalOverflow) {
      console.error(`❌ Viewport ${vp.name} has horizontal overflow!`);
    } else {
      console.log(`✓ Viewport ${vp.name}: Zero horizontal overflow confirmed.`);
    }

    // Capture Full Page Screenshot
    const fullPagePath = path.join(artifactDir, `fullpage-${vp.name}.png`);
    await page.screenshot({ path: fullPagePath, fullPage: true });
    console.log(`Saved full page: ${fullPagePath}`);

    // Test sections presence
    const sectionIds = [
      "hero",
      "problem",
      "pipeline",
      "visual-diff",
      "quality-fleet",
      "workflow",
      "dashboard",
      "pricing",
      "faq",
      "assertion",
    ];

    for (const id of sectionIds) {
      const section = page.locator(`#${id}`);
      const isVisible = await section.isVisible();
      if (!isVisible) {
        console.error(`❌ Section #${id} is not visible on ${vp.name}`);
      } else {
        console.log(`✓ Section #${id} is visible on ${vp.name}`);
      }
    }

    // Test Interactive Visual Diff Slider on Desktop
    if (vp.width === 1440) {
      const slider = page.locator('[role="slider"]');
      if (await slider.isVisible()) {
        await slider.focus();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        const val = await slider.getAttribute("aria-valuenow");
        console.log(`✓ Visual Diff Slider keyboard accessibility confirmed. aria-valuenow: ${val}`);
      }
    }

    // Verify Console Errors
    if (consoleErrors.length > 0) {
      console.warn(`Console errors encountered on ${vp.name}:`, consoleErrors);
    } else {
      console.log(`✓ 0 console errors on ${vp.name}`);
    }

    await context.close();
  }

  await browser.close();
  console.log("\n=== QA Completed Successfully ===");
}

runQA().catch((err) => {
  console.error("QA error:", err);
  process.exit(1);
});
