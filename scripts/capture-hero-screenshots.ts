import { chromium } from "playwright";
import path from "path";
import fs from "fs";

async function main() {
  const artifactDir = "/Users/rajan/.gemini/antigravity-cli/brain/1af5cda1-a9ff-47b1-bcfc-1198a807bd52";
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: "hero-375", width: 375, height: 812 },
    { name: "hero-768", width: 768, height: 1024 },
    { name: "hero-1440", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    console.log(`Navigating to http://localhost:3000 at ${vp.width}x${vp.height}...`);
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000); // let animations settle

    const outPath = path.join(artifactDir, `${vp.name}.png`);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved screenshot: ${outPath}`);
    await page.close();
  }

  await browser.close();
  console.log("All screenshots captured successfully.");
}

main().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
