import http from "http";
import { executeApiTest } from "../apps/web/src/lib/runner/api-executor";
import { validateApiTestSpec } from "../apps/web/src/lib/runner/api-validator";
import { ApiTestSpec } from "../apps/web/src/lib/runner/api-types";
import { db } from "../apps/web/src/lib/db";
import { orchestrateTestRun } from "../apps/web/src/lib/runner/orchestrator";

async function verifyPhase5A() {
  console.log("=== OmniTest Phase 5A: API Testing Acceptance Verification ===\n");

  // 1. Launch a local mock HTTP server for deterministic assertions & auth checks
  console.log("1. Starting Mock HTTP Test Server...");
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/api/users" && req.method === "GET") {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.includes("Bearer test-secret-token-123")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized: Invalid or missing bearer token" }));
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
        "X-Custom-Header": "OmniTest-API-v1",
      });
      res.end(
        JSON.stringify({
          success: true,
          users: [
            { id: 1, name: "Alice", role: "admin" },
            { id: 2, name: "Bob", role: "member" },
          ],
        })
      );
      return;
    }

    if (url.pathname === "/api/users" && req.method === "POST") {
      let bodyStr = "";
      req.on("data", (chunk) => {
        bodyStr += chunk;
      });
      req.on("end", () => {
        try {
          const payload = JSON.parse(bodyStr);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ created: true, user: { id: 42, ...payload } }));
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }

    if (url.pathname === "/api/slow") {
      setTimeout(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
      }, 500);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as any).port;
  const mockBaseUrl = `http://127.0.0.1:${port}`;
  console.log(`   ✓ Mock HTTP Server running on ${mockBaseUrl}`);

  try {
    // 2. Validate Spec Validator (Params, Headers, Auth, Assertions)
    console.log("\n2. Validating API Test Spec Validator & Schema...");
    const rawSpec = {
      version: "1.0",
      method: "GET",
      url: `${mockBaseUrl}/api/users`,
      params: [{ key: "page", value: "1", enabled: true }],
      headers: [{ key: "Accept", value: "application/json", enabled: true }],
      auth: { type: "bearer", bearerToken: "test-secret-token-123" },
      assertions: [
        { id: "a1", type: "status_equals", expected: "200" },
        { id: "a2", type: "status_is_2xx" },
        { id: "a3", type: "response_time_lt", expected: "1000" },
        { id: "a4", type: "header_exists", property: "x-custom-header" },
        { id: "a5", type: "header_equals", property: "x-custom-header", expected: "OmniTest-API-v1" },
        { id: "a6", type: "json_property_exists", property: "users.0.name" },
        { id: "a7", type: "json_property_equals", property: "users.0.name", expected: "Alice" },
        { id: "a8", type: "body_contains", expected: "success" },
      ],
    };

    const validatedSpec = validateApiTestSpec(rawSpec);
    console.log(`   ✓ Spec validated with ${validatedSpec.assertions.length} assertions.`);

    // 3. Test Independent API Execution Engine (GET + Bearer Auth + Assertions)
    console.log("\n3. Testing API Test Execution (GET with Bearer Auth)...");
    const getResult = await executeApiTest(validatedSpec);
    console.log(`   • Status: ${getResult.status}`);
    console.log(`   • HTTP Status Code: ${getResult.statusCode} ${getResult.statusText}`);
    console.log(`   • Duration: ${getResult.durationMs}ms`);
    console.log(`   • Passed Assertions: ${getResult.passedAssertions}/${getResult.totalAssertions}`);
    console.log(`   • Masked Headers:`, getResult.request.headers);

    if (getResult.status !== "PASSED" || getResult.passedAssertions !== 8) {
      throw new Error(`GET API execution failed: ${getResult.errorSummary}`);
    }
    console.log("   ✓ GET request and all 8 assertions PASSED.");

    // 4. Test POST with JSON body validation
    console.log("\n4. Testing API Test Execution (POST with JSON Body)...");
    const postSpec = validateApiTestSpec({
      version: "1.0",
      method: "POST",
      url: `${mockBaseUrl}/api/users`,
      bodyType: "json",
      body: JSON.stringify({ name: "Charlie", role: "developer" }),
      assertions: [
        { id: "p1", type: "status_equals", expected: "201" },
        { id: "p2", type: "json_property_equals", property: "created", expected: "true" },
        { id: "p3", type: "json_property_equals", property: "user.name", expected: "Charlie" },
      ],
    });

    const postResult = await executeApiTest(postSpec);
    console.log(`   • Status: ${postResult.status}`);
    console.log(`   • HTTP Status Code: ${postResult.statusCode}`);
    console.log(`   • Created User ID: ${(postResult.response?.jsonParsed as any)?.user?.id}`);

    if (postResult.status !== "PASSED" || postResult.passedAssertions !== 3) {
      throw new Error(`POST API execution failed: ${postResult.errorSummary}`);
    }
    console.log("   ✓ POST request with JSON body PASSED.");

    // 5. Test Assertion Failure Reporting
    console.log("\n5. Testing Detailed Assertion Failure Reporting...");
    const failingSpec = validateApiTestSpec({
      version: "1.0",
      method: "GET",
      url: `${mockBaseUrl}/api/users`,
      auth: { type: "bearer", bearerToken: "test-secret-token-123" },
      assertions: [
        { id: "f1", type: "status_equals", expected: "404" }, // will fail, actual is 200
      ],
    });

    const failingResult = await executeApiTest(failingSpec);
    console.log(`   • Status: ${failingResult.status}`);
    console.log(`   • Expected failure message: "${failingResult.errorSummary}"`);

    if (failingResult.status !== "FAILED" || !failingResult.errorSummary?.includes("200")) {
      throw new Error("Failing test assertion was not correctly identified.");
    }
    console.log("   ✓ Failure diagnostics and diff captured accurately.");

    // 6. Test Timeout Handling
    console.log("\n6. Testing Request Timeout Handling...");
    const timeoutSpec = validateApiTestSpec({
      version: "1.0",
      method: "GET",
      url: `${mockBaseUrl}/api/slow`,
      timeoutMs: 100, // Timeout before 500ms
      assertions: [{ id: "t1", type: "status_equals", expected: "200" }],
    });

    const timeoutResult = await executeApiTest(timeoutSpec);
    console.log(`   • Status: ${timeoutResult.status}`);
    console.log(`   • Error Summary: "${timeoutResult.errorSummary}"`);

    if (timeoutResult.status !== "TIMED_OUT") {
      throw new Error("Slow request did not trigger TIMED_OUT status.");
    }
    console.log("   ✓ Timeout handling verified.");

    // 7. Full Integration: Database Persistence & Test Run Orchestration
    console.log("\n7. Testing End-to-End Orchestrator Integration with DB...");
    const org = await db.organization.create({
      data: {
        name: "API Verification Corp",
        slug: `api-corp-${Date.now()}`,
      },
    });

    const project = await db.project.create({
      data: {
        organizationId: org.id,
        name: "E-Commerce Microservices",
        slug: `ecom-api-${Date.now()}`,
        baseUrl: mockBaseUrl,
      },
    });

    const suite = await db.testSuite.create({
      data: {
        projectId: project.id,
        name: "Users Microservice Suite",
      },
    });

    const test = await db.test.create({
      data: {
        suiteId: suite.id,
        title: "GET /api/users Auth & Schema",
        description: "Verifies users endpoint requires token and returns Alice",
        type: "API",
        config: JSON.stringify(validatedSpec),
        timeoutSeconds: 15,
      },
    });

    console.log(`   ✓ Created API Test in DB (ID: ${test.id}, type: ${test.type})`);

    // Run test through universal orchestrator
    const execution = await orchestrateTestRun({
      testId: test.id,
      projectId: project.id,
      trigger: "MANUAL",
      environment: "staging",
    });

    console.log(`   ✓ Orchestrated Run Complete:`);
    console.log(`     • Run ID: ${execution.run.id}`);
    console.log(`     • Run Status: ${execution.run.status}`);
    console.log(`     • TestResult Type: ${execution.testResult.testType}`);
    console.log(`     • TestResult Status: ${execution.testResult.status}`);
    console.log(`     • Duration: ${execution.testResult.durationMs}ms`);

    const metrics = JSON.parse(execution.testResult.metrics as string);
    console.log(`     • Metrics Recorded: HTTP ${metrics.statusCode}, ${metrics.passedAssertions}/${metrics.totalAssertions} Assertions Passed`);

    if (execution.run.status !== "PASSED" || execution.testResult.testType !== "API") {
      throw new Error("Orchestrated API test run did not succeed.");
    }

    // 8. Clean up
    console.log("\n8. Cleaning up test database records & mock server...");
    await db.testResult.deleteMany({ where: { testRunId: execution.run.id } });
    await db.testRun.delete({ where: { id: execution.run.id } });
    await db.test.delete({ where: { id: test.id } });
    await db.testSuite.delete({ where: { id: suite.id } });
    await db.project.delete({ where: { id: project.id } });
    await db.organization.delete({ where: { id: org.id } });
    console.log("   ✓ Cleaned up test database records.");

    console.log("\n🎉 ALL PHASE 5A API TESTING ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  } finally {
    server.close();
  }
}

verifyPhase5A().catch((err) => {
  console.error("\n❌ PHASE 5A VERIFICATION FAILED:", err);
  process.exit(1);
});
