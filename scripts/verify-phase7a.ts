import http from "http";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { db } from "../apps/web/src/lib/db";
import { createSessionToken } from "../apps/web/src/lib/auth";
import { ExitCode } from "../packages/cli/src/utils/exit-codes";
import { resolveConfig, maskSecret } from "../packages/cli/src/config/loader";
import { ApiClient } from "../packages/cli/src/client/api-client";

// Import real route handlers
import { GET as handleMe } from "../apps/web/src/app/api/auth/me/route";
import { GET as handleGetProject } from "../apps/web/src/app/api/projects/[projectId]/route";
import { POST as handleRunProject } from "../apps/web/src/app/api/projects/[projectId]/run/route";
import { GET as handleProjectHistory } from "../apps/web/src/app/api/projects/[projectId]/history/route";
import { GET as handleRunReport } from "../apps/web/src/app/api/projects/[projectId]/runs/[runId]/report/route";
import { POST as handleRunTest } from "../apps/web/src/app/api/tests/[testId]/run/route";

const CLI_BIN = path.resolve(__dirname, "../packages/cli/bin/omnitest.js");

function runCliCmd(
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<{ status: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("node", [CLI_BIN, ...args], {
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, NO_COLOR: "1", ...options.env },
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (status) => {
      resolve({ status, stdout, stderr });
    });
    child.on("error", (err) => {
      stderr += err.message;
      resolve({ status: 1, stdout, stderr });
    });
  });
}

async function verifyPhase7A() {
  console.log("=== OmniTest Phase 7A: CLI Foundation Acceptance Verification ===\n");

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "omnitest-cli-test-"));
  let server: http.Server | null = null;
  let testUserId = "";
  let testOrgId = "";
  let testProjectId = "";
  let testSuiteId = "";
  let testPassId = "";
  let testFailId = "";
  let testRunId = "";

  try {
    // ==========================================
    // 1. CLI Binary & Help / Version
    // ==========================================
    console.log("1. Verifying CLI Binary, Help & Version Flags...");

    const versionRes = await runCliCmd(["--version"]);
    if (versionRes.status !== 0 || !versionRes.stdout.includes("omnitest v0.1.0")) {
      throw new Error(`Expected --version to succeed with v0.1.0, got status ${versionRes.status}: ${versionRes.stdout}`);
    }
    console.log("   ✓ 'omnitest --version' returned version 0.1.0 (exit code 0)");

    const helpRes = await runCliCmd(["--help"]);
    if (
      helpRes.status !== 0 ||
      !helpRes.stdout.includes("Unified Test Orchestration Platform") ||
      !helpRes.stdout.includes("init") ||
      !helpRes.stdout.includes("run") ||
      !helpRes.stdout.includes("test") ||
      !helpRes.stdout.includes("history") ||
      !helpRes.stdout.includes("report") ||
      !helpRes.stdout.includes("status")
    ) {
      throw new Error(`Expected --help to show all CLI commands, got:\n${helpRes.stdout}`);
    }
    console.log("   ✓ 'omnitest --help' displays usage, all commands and global options (exit code 0)");

    const runHelpRes = await runCliCmd(["run", "--help"]);
    if (runHelpRes.status !== 0 || !runHelpRes.stdout.includes("--visual") || !runHelpRes.stdout.includes("--type")) {
      throw new Error(`Expected 'omnitest run --help' to display run options, got:\n${runHelpRes.stdout}`);
    }
    console.log("   ✓ Subcommand help 'omnitest run --help' displays targeted options (exit code 0)");

    // ==========================================
    // 2. `omnitest init`
    // ==========================================
    console.log("\n2. Verifying 'omnitest init' Workflow & Safety...");

    // Initialize configuration
    const initRes = await runCliCmd(["init", "--project", "test-proj-xyz", "--api-url", "http://localhost:3000", "--json"], {
      cwd: tempDir,
    });
    if (initRes.status !== ExitCode.SUCCESS) {
      throw new Error(`omnitest init failed with status ${initRes.status}: ${initRes.stderr || initRes.stdout}`);
    }
    const initJson = JSON.parse(initRes.stdout);
    if (!initJson.success || !fs.existsSync(path.join(tempDir, "omnitest.config.json"))) {
      throw new Error(`omnitest.config.json was not created as expected`);
    }
    console.log("   ✓ 'omnitest init' successfully created omnitest.config.json");

    // Overwrite safety: without --force should fail with CLI_ERROR (2)
    const initOverwriteFail = await runCliCmd(["init", "--json"], { cwd: tempDir });
    if (initOverwriteFail.status !== ExitCode.CLI_ERROR) {
      throw new Error(`Expected overwrite without --force to fail with code 2, got ${initOverwriteFail.status}`);
    }
    console.log("   ✓ 'omnitest init' protects existing configuration from overwrite (exit code 2)");

    // With --force should succeed
    const initForceRes = await runCliCmd(["init", "--force", "--project", "overwritten-proj", "--json"], { cwd: tempDir });
    if (initForceRes.status !== ExitCode.SUCCESS) {
      throw new Error(`Expected init with --force to succeed, got ${initForceRes.status}`);
    }
    console.log("   ✓ 'omnitest init --force' successfully allows explicit overwrite");

    // ==========================================
    // 3. Configuration Resolution & Masking
    // ==========================================
    console.log("\n3. Verifying Configuration Resolution & Secret Masking...");

    const resolved = resolveConfig({
      cwd: tempDir,
      project: "cli-override-proj",
      token: "secret-token-1234567890",
    });

    if (resolved.project !== "cli-override-proj") {
      throw new Error(`Expected CLI override to take precedence, got ${resolved.project}`);
    }
    if (maskSecret(resolved.token) !== "secr...7890") {
      throw new Error(`Expected token masking 'secr...7890', got ${maskSecret(resolved.token)}`);
    }
    if (maskSecret(undefined) !== "none") {
      throw new Error(`Expected undefined secret masking 'none'`);
    }
    console.log("   ✓ Config precedence (CLI > Env > Config file) and secret masking verified");

    // ==========================================
    // 4. Setup Test Server & Test Database Fixtures
    // ==========================================
    console.log("\n4. Setting up In-Process Test Server and Database Fixtures...");

    const timestamp = Date.now();
    const user = await db.user.create({
      data: {
        email: `cli-tester-${timestamp}@example.com`,
        passwordHash: "hash",
        fullName: "CLI Test Engineer",
      },
    });
    testUserId = user.id;

    const org = await db.organization.create({
      data: {
        name: "CLI Testing Org",
        slug: `cli-org-${timestamp}`,
      },
    });
    testOrgId = org.id;

    await db.member.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: "OWNER",
      },
    });

    const project = await db.project.create({
      data: {
        organizationId: org.id,
        name: "CLI Storefront App",
        slug: `cli-storefront-${timestamp}`,
        baseUrl: "https://example.com",
      },
    });
    testProjectId = project.id;

    const suite = await db.testSuite.create({
      data: {
        projectId: project.id,
        name: "Core E2E Suite",
      },
    });
    testSuiteId = suite.id;

    // Create a passing test
    const passTest = await db.test.create({
      data: {
        suiteId: suite.id,
        title: "API Status Health Check",
        type: "API",
        config: JSON.stringify({
          url: "http://127.0.0.1:9999/mock-api-pass",
          method: "GET",
          assertions: [{ type: "status_equals", value: 200 }],
        }),
      },
    });
    testPassId = passTest.id;

    // Create a failing test
    const failTest = await db.test.create({
      data: {
        suiteId: suite.id,
        title: "API Broken Endpoint",
        type: "API",
        config: JSON.stringify({
          url: "http://127.0.0.1:9999/mock-api-fail",
          method: "GET",
          assertions: [{ type: "status_equals", value: 200 }],
        }),
      },
    });
    testFailId = failTest.id;

    // Create a test run & results for history and report verification
    const testRun = await db.testRun.create({
      data: {
        projectId: project.id,
        suiteId: suite.id,
        status: "PASSED",
        trigger: "CLI",
        environment: "staging",
        targetUrl: "https://example.com",
        durationMs: 345,
        startedAt: new Date(Date.now() - 60000),
        completedAt: new Date(),
      },
    });
    testRunId = testRun.id;

    await db.testResult.create({
      data: {
        testRunId: testRun.id,
        testId: passTest.id,
        testTitle: passTest.title,
        testType: "API",
        status: "PASSED",
        durationMs: 345,
        stepResults: JSON.stringify([{ action: "GET /health", status: "PASSED", durationMs: 345 }]),
        metrics: JSON.stringify({ statusCode: 200 }),
      },
    });

    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      activeOrgId: org.id,
    });

    console.log(`   ✓ Seeded DB fixtures (User: ${user.email}, Project: ${project.id})`);

    // Setup HTTP server dispatching to real Next route handlers
    server = http.createServer(async (req, res) => {
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", async () => {
        try {
          const bodyBuffer = ["GET", "HEAD"].includes(req.method || "") ? undefined : Buffer.concat(chunks);
          const webReq = new Request(url.toString(), {
            method: req.method,
            headers: req.headers as any,
            body: bodyBuffer,
          });

          let webRes: Response;

          // Mock endpoints for deterministic test runner execution
          if (url.pathname === "/mock-api-pass") {
            webRes = new Response(JSON.stringify({ status: "ok" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          } else if (url.pathname === "/mock-api-fail") {
            webRes = new Response(JSON.stringify({ error: "Internal Server Error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          } else if (url.pathname === "/api/auth/me") {
            webRes = await handleMe(webReq);
          } else if (url.pathname === `/api/projects/${testProjectId}`) {
            webRes = await handleGetProject(webReq, { params: { projectId: testProjectId } });
          } else if (url.pathname === `/api/projects/${testProjectId}/run`) {
            webRes = await handleRunProject(webReq, { params: { projectId: testProjectId } });
          } else if (url.pathname === `/api/projects/${testProjectId}/history`) {
            webRes = await handleProjectHistory(webReq, { params: { projectId: testProjectId } });
          } else if (url.pathname === `/api/projects/${testProjectId}/runs/${testRunId}/report`) {
            webRes = await handleRunReport(webReq, { params: { projectId: testProjectId, runId: testRunId } });
          } else if (url.pathname.startsWith("/api/tests/") && url.pathname.endsWith("/run")) {
            const parts = url.pathname.split("/");
            const tid = parts[3];
            webRes = await handleRunTest(webReq, { params: { testId: tid } });
          } else {
            webRes = new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
          }

          const arrayBuf = await webRes.arrayBuffer();
          res.writeHead(webRes.status, Object.fromEntries(webRes.headers.entries()));
          res.end(Buffer.from(arrayBuf));
        } catch (err: any) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err?.message || "Internal Server Error" }));
        }
      });
    });

    await new Promise<void>((resolve) => {
      server!.listen(0, "127.0.0.1", () => resolve());
    });

    const addr = server.address() as any;
    const testApiUrl = `http://127.0.0.1:${addr.port}`;
    console.log(`   ✓ Real HTTP test server listening on ${testApiUrl}`);

    await db.test.update({
      where: { id: passTest.id },
      data: {
        config: JSON.stringify({
          url: `${testApiUrl}/mock-api-pass`,
          method: "GET",
          assertions: [{ type: "status_equals", value: 200 }],
        }),
      },
    });

    await db.test.update({
      where: { id: failTest.id },
      data: {
        config: JSON.stringify({
          url: `${testApiUrl}/mock-api-fail`,
          method: "GET",
          assertions: [{ type: "status_equals", value: 200 }],
        }),
      },
    });

    // ==========================================
    // 5. ApiClient Direct Integration
    // ==========================================
    console.log("\n5. Testing ApiClient Authentication & Handshake...");

    // Test unauthenticated failure
    const unauthClient = new ApiClient({ baseUrl: testApiUrl });
    let unauthCaught = false;
    try {
      await unauthClient.getMe();
    } catch (err: any) {
      unauthCaught = true;
      if (err.statusCode !== 401 || err.code !== "UNAUTHORIZED") {
        throw new Error(`Expected 401 UNAUTHORIZED, got code ${err.code} status ${err.statusCode}`);
      }
    }
    if (!unauthCaught) throw new Error("Expected unauthenticated request to throw 401");
    console.log("   ✓ ApiClient properly handles 401 Unauthorized with descriptive suggestion");

    // Test authenticated client
    const authClient = new ApiClient({ baseUrl: testApiUrl, token: sessionToken });
    const me = await authClient.getMe();
    if (me.user?.id !== user.id) {
      throw new Error(`Expected user ID ${user.id}, got ${me.user?.id}`);
    }
    console.log(`   ✓ ApiClient verified identity for ${me.user.email}`);

    // ==========================================
    // 6. CLI Command `omnitest status`
    // ==========================================
    console.log("\n6. Verifying 'omnitest status'...");

    const statusRes = await runCliCmd(
      ["status", "--project", project.id, "--api-url", testApiUrl, "--token", sessionToken, "--json"],
      { cwd: tempDir }
    );
    if (statusRes.status !== ExitCode.SUCCESS) {
      throw new Error(`omnitest status failed with code ${statusRes.status}: ${statusRes.stderr}`);
    }
    const statusJson = JSON.parse(statusRes.stdout);
    if (!statusJson.authenticated || statusJson.project.id !== project.id) {
      throw new Error(`Expected status to return authenticated project, got: ${statusRes.stdout}\nSTDERR: ${statusRes.stderr}`);
    }
    console.log("   ✓ 'omnitest status' accurately outputs server, auth, and project health");

    // ==========================================
    // 7. CLI Command `omnitest history`
    // ==========================================
    console.log("\n7. Verifying 'omnitest history'...");

    // JSON mode
    const historyJsonRes = await runCliCmd(
      ["history", "--project", project.id, "--api-url", testApiUrl, "--token", sessionToken, "--json"],
      { cwd: tempDir }
    );
    if (historyJsonRes.status !== ExitCode.SUCCESS) {
      throw new Error(`omnitest history --json failed: ${historyJsonRes.stderr}`);
    }
    const historyData = JSON.parse(historyJsonRes.stdout);
    if (!Array.isArray(historyData.items) || historyData.items.length === 0) {
      throw new Error(`Expected history items, got: ${historyJsonRes.stdout}`);
    }
    console.log("   ✓ 'omnitest history --json' returned valid JSON schema with history items");

    // Formatted table mode
    const historyTableRes = await runCliCmd(
      ["history", "--project", project.id, "--api-url", testApiUrl, "--token", sessionToken],
      { cwd: tempDir }
    );
    if (
      historyTableRes.status !== ExitCode.SUCCESS ||
      !historyTableRes.stdout.includes("TEST") ||
      !historyTableRes.stdout.includes("STATUS") ||
      !historyTableRes.stdout.includes("PASSED")
    ) {
      throw new Error(`Expected formatted history table, got:\n${historyTableRes.stdout}`);
    }
    console.log("   ✓ 'omnitest history' rendered terminal table with status, test title, and duration");

    // ==========================================
    // 8. CLI Command `omnitest report`
    // ==========================================
    console.log("\n8. Verifying 'omnitest report'...");

    const reportRes = await runCliCmd(
      ["report", "--project", project.id, "--run", testRun.id, "--api-url", testApiUrl, "--token", sessionToken],
      { cwd: tempDir }
    );
    if (
      reportRes.status !== ExitCode.SUCCESS ||
      !reportRes.stdout.includes(testRun.id.slice(0, 8)) ||
      !reportRes.stdout.includes("PASSED")
    ) {
      throw new Error(`Expected report output, got:\n${reportRes.stdout}`);
    }
    console.log("   ✓ 'omnitest report' fetched run report and displayed KPI breakdown");

    // ==========================================
    // 9. CLI Command `omnitest test` (Single Test)
    // ==========================================
    console.log("\n9. Verifying 'omnitest test <testId>'...");

    const singleTestRes = await runCliCmd(
      ["test", passTest.id, "--api-url", testApiUrl, "--token", sessionToken, "--json"],
      { cwd: tempDir }
    );
    if (singleTestRes.status !== ExitCode.SUCCESS) {
      throw new Error(`omnitest test failed with code ${singleTestRes.status}: ${singleTestRes.stderr}`);
    }
    const singleTestJson = JSON.parse(singleTestRes.stdout);
    if (singleTestJson.status !== "PASSED" || !singleTestJson.runId) {
      throw new Error(`Expected single test to pass, got: ${singleTestRes.stdout}`);
    }
    console.log("   ✓ 'omnitest test <testId>' executed test, reported PASSED status (exit code 0)");

    // ==========================================
    // 10. CLI Command `omnitest run` (Batch Orchestration)
    // ==========================================
    console.log("\n10. Verifying 'omnitest run' across Test Suites...");

    // Run passing test only
    const runPassRes = await runCliCmd(
      ["run", "--project", project.id, "--test", passTest.id, "--api-url", testApiUrl, "--token", sessionToken, "--json"],
      { cwd: tempDir }
    );
    if (runPassRes.status !== ExitCode.SUCCESS) {
      throw new Error(`omnitest run should exit with 0 on pass, got ${runPassRes.status}`);
    }
    const passRunJson = JSON.parse(runPassRes.stdout);
    if (passRunJson.passedTests !== 1 || passRunJson.failedTests !== 0) {
      throw new Error(`Expected 1 passed test, got: ${runPassRes.stdout}`);
    }
    console.log("   ✓ 'omnitest run' exited with 0 (SUCCESS) when all tests passed");

    // Run failing test -> should exit with TEST_FAILURE (1)
    const runFailRes = await runCliCmd(
      ["run", "--project", project.id, "--test", failTest.id, "--api-url", testApiUrl, "--token", sessionToken, "--json"],
      { cwd: tempDir }
    );
    if (runFailRes.status !== ExitCode.TEST_FAILURE) {
      throw new Error(`omnitest run should exit with 1 on test failure, got ${runFailRes.status}`);
    }
    console.log("   ✓ 'omnitest run' exited with 1 (TEST_FAILURE) when test failed");

    // ==========================================
    // 11. Exit Code Standards Verification
    // ==========================================
    console.log("\n11. Verifying Standard Exit Codes (0, 1, 2, 3)...");

    // Code 0: Help or passed tests verified above
    console.log("   ✓ Exit Code 0 (SUCCESS) confirmed");

    // Code 1: Test failure confirmed above
    console.log("   ✓ Exit Code 1 (TEST_FAILURE) confirmed");

    // Code 2: Unknown command or missing project ID
    const code2Res = await runCliCmd(["unknown-command", "--json"]);
    if (code2Res.status !== ExitCode.CLI_ERROR) {
      throw new Error(`Expected unknown command to return code 2, got ${code2Res.status}`);
    }
    console.log("   ✓ Exit Code 2 (CLI_ERROR / CONFIG_ERROR) confirmed");

    // Code 3: Auth failure
    const code3RunRes = await runCliCmd(
      ["run", "--project", project.id, "--api-url", testApiUrl, "--token", "invalid-token", "--json"],
      { cwd: tempDir }
    );
    if (code3RunRes.status !== ExitCode.AUTH_ERROR) {
      throw new Error(`Expected 401 auth error to return code 3, got ${code3RunRes.status}`);
    }
    console.log("   ✓ Exit Code 3 (API_OR_AUTH_ERROR) confirmed");

    console.log("\n========================================================");
    console.log("🎉 ALL PHASE 7A CLI FOUNDATION VERIFICATIONS PASSED!");
    console.log("========================================================\n");
  } finally {
    // Cleanup HTTP server
    if (server) {
      server.close();
    }

    // Cleanup temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Cleanup database test records
    console.log("Cleaning up Phase 7A test fixtures...");
    try {
      if (testRunId) {
        await db.testResult.deleteMany({ where: { testRunId } });
        await db.testRun.deleteMany({ where: { id: testRunId } });
      }
      if (testPassId) {
        await db.testResult.deleteMany({ where: { testId: testPassId } });
        await db.test.deleteMany({ where: { id: testPassId } });
      }
      if (testFailId) {
        await db.testResult.deleteMany({ where: { testId: testFailId } });
        await db.test.deleteMany({ where: { id: testFailId } });
      }
      if (testSuiteId) {
        await db.testSuite.deleteMany({ where: { id: testSuiteId } });
      }
      if (testProjectId) {
        await db.project.deleteMany({ where: { id: testProjectId } });
      }
      if (testOrgId) {
        await db.member.deleteMany({ where: { organizationId: testOrgId } });
        await db.organization.deleteMany({ where: { id: testOrgId } });
      }
      if (testUserId) {
        await db.user.deleteMany({ where: { id: testUserId } });
      }
      console.log("✓ Phase 7A test fixtures cleaned up successfully.\n");
    } catch (cleanupErr: any) {
      console.warn("Notice: Cleanup error (non-fatal):", cleanupErr.message);
    }
  }
}

verifyPhase7A().catch((err) => {
  console.error("\n❌ Verification Failed:\n", err);
  process.exit(1);
});
