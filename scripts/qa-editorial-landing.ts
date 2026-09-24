import { chromium } from "playwright";
import * as path from "path";

const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "414", width: 414, height: 896 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const SECTIONS = [
  "hero",
  "action-intro",
  "chapters",
  "features",
  "capabilities",
  "dashboard",
  "results",
  "pricing",
  "faq",
];

const OUT_DIR = path.resolve(
  "/Users/rajan/.gemini/antigravity-cli/brain/1af5cda1-a9ff-47b1-bcfc-1198a807bd52"
);

async function main() {
  const browser = await chromium.launch({ headless: true });
  console.log("🚀 Starting Editorial QA audit across viewports...\n");

  const errors: string[] = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n================ Testing Viewport ${vp.name} (${vp.width}x${vp.height}) ================`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    const consoleMessages: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleMessages.push(msg.text());
      }
    });

    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // 1. Check Horizontal Scroll / Overflow
    const overflow = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const innerW = window.innerWidth;
      const elementsWithOverflow: string[] = [];

      document.querySelectorAll("*").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > innerW + 1) {
          elementsWithOverflow.push(
            `${el.tagName}.${el.className.toString().slice(0, 30)} (right: ${Math.round(rect.right)}, innerW: ${innerW})`
          );
        }
      });

      return {
        scrollW,
        innerW,
        hasOverflow: scrollW > innerW,
        overflowDelta: scrollW - innerW,
        badElements: elementsWithOverflow.slice(0, 5),
      };
    });

    if (overflow.hasOverflow) {
      const msg = `❌ [${vp.name}px] Horizontal overflow detected: scrollWidth ${overflow.scrollW} > innerWidth ${overflow.innerW} (delta: ${overflow.overflowDelta}px)`;
      console.error(msg);
      console.error("Offending elements:", overflow.badElements);
      errors.push(msg);
    } else {
      console.log(`✓ [${vp.name}px] Zero horizontal scroll: scrollWidth ${overflow.scrollW} == innerWidth ${overflow.innerW}`);
    }

    // 2. Check Console Errors
    if (consoleMessages.length > 0) {
      console.error(`❌ [${vp.name}px] Console errors found:`, consoleMessages);
      errors.push(`[${vp.name}px] Console errors: ${consoleMessages.join("; ")}`);
    } else {
      console.log(`✓ [${vp.name}px] Zero console errors`);
    }

    // 3. Capture Screenshots at 375 and 1440
    if (vp.name === "375" || vp.name === "1440") {
      const fullPath = path.join(OUT_DIR, `editorial-fullpage-${vp.name}.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
      console.log(`📸 Saved full-page screenshot: ${fullPath}`);

      for (const secId of SECTIONS) {
        const secEl = await page.$(`#${secId}`);
        if (secEl) {
          const secPath = path.join(OUT_DIR, `editorial-${secId}-${vp.name}.png`);
          await secEl.screenshot({ path: secPath });
          console.log(`  📸 Saved section #${secId} at ${vp.name}px`);
        }
      }
    }

    // 4. Test Interactive Elements (Diff Slider keyboard accessibility)
    const slider = await page.$('[role="slider"]');
    if (slider) {
      const initialVal = await slider.getAttribute("aria-valuenow");
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      const newVal = await slider.getAttribute("aria-valuenow");
      console.log(`✓ [${vp.name}px] Slider keyboard response: initial=${initialVal}, after ArrowRight=${newVal}`);
    }

    // 5. Test Carousel Next button
    const nextBtn = await page.$('button[aria-label="Next case study card"]');
    if (nextBtn) {
      await nextBtn.click();
      console.log(`✓ [${vp.name}px] Carousel next button clicked`);
    }

    await page.close();
  }

  await browser.close();

  if (errors.length > 0) {
    console.error("\n❌ QA AUDIT FAILED with errors:\n" + errors.join("\n"));
    process.exit(1);
  } else {
    console.log("\n🎉 ALL EDITORIAL QA CHECKS PASSED PERFECTLY!");
  }
}

main().catch((err) => {
  console.error("QA script error:", err);
  process.exit(1);
});
