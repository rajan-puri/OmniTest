#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

const distPath = path.join(__dirname, "..", "dist", "index.js");

function handleExit(promise) {
  promise
    .then((code) => {
      process.exit(typeof code === "number" ? code : 0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

if (fs.existsSync(distPath)) {
  const { runCli } = require(distPath);
  handleExit(runCli(process.argv.slice(2)));
} else {
  // Development mode fallback
  try {
    require("tsx/cjs");
    const { runCli } = require(path.join(__dirname, "..", "src", "index.ts"));
    handleExit(runCli(process.argv.slice(2)));
  } catch (err) {
    console.error("OmniTest CLI build not found. Run 'npm run build --workspace=@omnitest/cli' first.");
    process.exit(2);
  }
}
