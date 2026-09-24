"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCode2,
  ArrowLeft,
  Plus,
  Trash2,
  Play,
  Save,
  Loader2,
  AlertCircle,
  Sparkles,
  Video,
  Globe2,
  Eye,
  Send,
  Zap,
  Search,
} from "lucide-react";
import { StepAction, TestStep } from "@/lib/runner/types";
import { ApiTestSpec } from "@/lib/runner/api-types";
import { A11yTestSpec } from "@/lib/runner/a11y-types";
import { PerformanceTestSpec } from "@/lib/runner/perf-types";
import { SeoTestSpec } from "@/lib/runner/seo-types";
import { TestRecorder } from "@/components/recorder/TestRecorder";
import { ApiRequestBuilder } from "@/components/api/ApiRequestBuilder";
import { ApiResponseViewer } from "@/components/api/ApiResponseViewer";
import { A11yTestConfig } from "@/components/a11y/A11yTestConfig";
import { PerformanceTestConfig } from "@/components/performance/PerformanceTestConfig";
import { SeoTestConfig } from "@/components/seo/SeoTestConfig";
import { ApiExecutionResult } from "@/lib/runner/api-types";

export default function NewTestPage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const { projectId } = params;

  const [testType, setTestType] = useState<"UI" | "API" | "ACCESSIBILITY" | "PERFORMANCE" | "SEO">("UI");
  const [projectBaseUrl, setProjectBaseUrl] = useState("http://localhost:3000");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // SEO Test Spec State
  const [seoSpec, setSeoSpec] = useState<SeoTestSpec>({
    version: "1.0",
    url: "http://localhost:3000",
    timeoutSeconds: 30,
    checks: {
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
    },
    assertions: {
      titleRequired: true,
      metaDescriptionRequired: true,
      canonicalRequired: true,
      h1Required: true,
      noindexDisallowed: false,
      expectedStatusCode: 200,
      structuredDataRequired: false,
      noBrokenLinks: false,
    },
  });

  // Performance Test Spec State
  const [perfSpec, setPerfSpec] = useState<PerformanceTestSpec>({
    version: "1.0",
    url: "http://localhost:3000",
    device: "desktop",
    warmupRuns: 0,
    measurementRuns: 1,
    thresholds: [
      { id: "t_lcp", metric: "lcp", operator: "lt", targetValue: 2500, unit: "ms" },
      { id: "t_cls", metric: "cls", operator: "lt", targetValue: 0.1, unit: "score" },
      { id: "t_fcp", metric: "fcp", operator: "lt", targetValue: 1800, unit: "ms" },
      { id: "t_ttfb", metric: "ttfb", operator: "lt", targetValue: 800, unit: "ms" },
      { id: "t_failed", metric: "failedRequests", operator: "eq", targetValue: 0, unit: "count" },
    ],
    timeoutSeconds: 30,
  });

  // A11y Test Spec State
  const [a11ySpec, setA11ySpec] = useState<A11yTestSpec>({
    version: "1.0",
    url: "http://localhost:3000",
    scope: "page",
    standards: ["wcag2a", "wcag2aa"],
    timeoutSeconds: 30,
  });

  // UI Test Steps State
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "step_1",
      action: "goto",
      target: "http://localhost:3000",
      options: { timeoutMs: 15000 },
    },
    {
      id: "step_2",
      action: "assert_visible",
      target: "body",
      options: { timeoutMs: 5000 },
    },
    {
      id: "step_3",
      action: "screenshot",
      value: "homepage_loaded",
    },
  ]);

  // API Test Spec State
  const [apiSpec, setApiSpec] = useState<ApiTestSpec>({
    version: "1.0",
    method: "GET",
    url: "https://api.example.com/users",
    params: [{ key: "limit", value: "10", enabled: true }],
    headers: [
      { key: "Accept", value: "application/json", enabled: true },
      { key: "Content-Type", value: "application/json", enabled: true },
    ],
    bodyType: "none",
    auth: { type: "none" },
    assertions: [
      { id: "assert_1", type: "status_equals", expected: "200" },
      { id: "assert_2", type: "response_time_lt", expected: "1000" },
    ],
    timeoutMs: 10000,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExecutingApiPreview, setIsExecutingApiPreview] = useState(false);
  const [apiPreviewResult, setApiPreviewResult] = useState<ApiExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);

  const handleStepsGenerated = (recordedSteps: TestStep[]) => {
    setSteps(recordedSteps);
    setShowRecorder(false);
    if (!title) {
      setTitle("Recorded User Flow");
    }
  };

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.project.baseUrl) {
            setProjectBaseUrl(data.project.baseUrl);
            // Default first step to base URL
            setSteps((prev) => [
              {
                ...prev[0],
                target: data.project.baseUrl,
              },
              ...prev.slice(1),
            ]);
            // Default API URL to base URL
            setApiSpec((prev) => ({
              ...prev,
              url: data.project.baseUrl ? `${data.project.baseUrl}/api/health` : prev.url,
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load project base url:", e);
      }
    }
    loadProject();
  }, [projectId]);

  const addStep = (action: StepAction) => {
    const id = `step_${steps.length + 1}_${Date.now()}`;
    let defaultTarget = "";
    let defaultValue = "";

    switch (action) {
      case "goto":
        defaultTarget = projectBaseUrl;
        break;
      case "click":
        defaultTarget = "button";
        break;
      case "fill":
        defaultTarget = "input[type='text']";
        defaultValue = "test input";
        break;
      case "press":
        defaultTarget = "Enter";
        break;
      case "wait":
        defaultTarget = "1000";
        break;
      case "screenshot":
        defaultValue = `screenshot_${steps.length + 1}`;
        break;
      case "assert_url":
        defaultTarget = "/";
        break;
      case "assert_text":
        defaultTarget = "h1";
        defaultValue = "Welcome";
        break;
      case "assert_visible":
        defaultTarget = "body";
        break;
    }

    setSteps([
      ...steps,
      {
        id,
        action,
        target: defaultTarget,
        value: defaultValue,
      },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) {
      setError("Test must have at least one step.");
      return;
    }
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof TestStep, val: unknown) => {
    setSteps(
      steps.map((st, i) => {
        if (i === index) {
          return { ...st, [field]: val };
        }
        return st;
      })
    );
  };

  const loadHomepagePreset = () => {
    setTitle("Homepage loads");
    setDescription("Verifies the landing page renders without errors and captures visual proof");
    setTestType("UI");
    setSteps([
      {
        id: "step_1",
        action: "goto",
        target: projectBaseUrl,
        options: { timeoutMs: 15000 },
      },
      {
        id: "step_2",
        action: "assert_visible",
        target: "body",
        options: { timeoutMs: 5000 },
      },
      {
        id: "step_3",
        action: "screenshot",
        value: "homepage_loaded",
      },
    ]);
  };

  const loadApiPreset = () => {
    setTitle("Users API Health Check");
    setDescription("Verifies the users endpoint returns 200 with valid JSON within SLA");
    setTestType("API");
    setApiSpec({
      version: "1.0",
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/users",
      params: [{ key: "_limit", value: "5", enabled: true }],
      headers: [
        { key: "Accept", value: "application/json", enabled: true },
      ],
      bodyType: "none",
      auth: { type: "none" },
      assertions: [
        { id: "assert_1", type: "status_equals", expected: "200" },
        { id: "assert_2", type: "response_time_lt", expected: "2000" },
        { id: "assert_3", type: "header_exists", property: "content-type" },
        { id: "assert_4", type: "json_property_exists", property: "0.name" },
      ],
      timeoutMs: 10000,
    });
  };

  const loadA11yPreset = () => {
    setTitle("Homepage Accessibility Audit");
    setDescription("Automated WCAG 2.1 Level A & AA compliance scan via axe-core");
    setTestType("ACCESSIBILITY");
    setA11ySpec({
      version: "1.0",
      url: projectBaseUrl || "https://example.com",
      scope: "page",
      standards: ["wcag2a", "wcag2aa", "best-practice"],
      timeoutSeconds: 30,
    });
  };

  const loadPerformancePreset = () => {
    setTitle("Core Web Vitals & Load Audit");
    setDescription("Measures real LCP, CLS, FCP, TTFB, and network resources in headless Chromium");
    setTestType("PERFORMANCE");
    setPerfSpec({
      version: "1.0",
      url: projectBaseUrl || "https://example.com",
      device: "desktop",
      warmupRuns: 0,
      measurementRuns: 1,
      thresholds: [
        { id: "t_lcp", metric: "lcp", operator: "lt", targetValue: 2500, unit: "ms" },
        { id: "t_cls", metric: "cls", operator: "lt", targetValue: 0.1, unit: "score" },
        { id: "t_fcp", metric: "fcp", operator: "lt", targetValue: 1800, unit: "ms" },
        { id: "t_ttfb", metric: "ttfb", operator: "lt", targetValue: 800, unit: "ms" },
        { id: "t_failed", metric: "failedRequests", operator: "eq", targetValue: 0, unit: "count" },
      ],
      timeoutSeconds: 30,
    });
  };

  const loadSeoPreset = () => {
    setTitle("Homepage Technical SEO Audit");
    setDescription("Automated page metadata, crawlability signals, structured data, and heading audit");
    setTestType("SEO");
    setSeoSpec({
      version: "1.0",
      url: projectBaseUrl || "https://example.com",
      timeoutSeconds: 30,
      checks: {
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
      },
      assertions: {
        titleRequired: true,
        metaDescriptionRequired: true,
        canonicalRequired: true,
        h1Required: true,
        noindexDisallowed: false,
        expectedStatusCode: 200,
        structuredDataRequired: false,
        noBrokenLinks: false,
      },
    });
  };

  // Live send request execution inside new test page
  const handleDirectApiTest = async (specToSend: ApiTestSpec) => {
    setIsExecutingApiPreview(true);
    setError(null);
    try {
      // Create temporary test or dispatch runner directly
      const res = await fetch(`/api/projects/${projectId}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || `${specToSend.method} ${specToSend.url}`,
          description: description || "Interactive API preview test",
          type: "API",
          apiConfig: specToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create API test.");

      const runRes = await fetch(`/api/tests/${data.test.id}/run`, {
        method: "POST",
      });
      const runData = await runRes.json();
      if (!runRes.ok) throw new Error(runData.error || "Failed to run API test.");

      if (runData.testResult?.metrics) {
        setApiPreviewResult({
          status: runData.testResult.status,
          durationMs: runData.durationMs,
          statusCode: runData.testResult.metrics.statusCode,
          statusText: runData.testResult.metrics.statusText,
          request: runData.testResult.metrics.request,
          response: runData.testResult.metrics.response,
          assertions: runData.testResult.metrics.assertions || [],
          totalAssertions: runData.testResult.metrics.totalAssertions || 0,
          passedAssertions: runData.testResult.metrics.passedAssertions || 0,
          failedAssertions: runData.testResult.metrics.failedAssertions || 0,
          errorSummary: runData.testResult.errorMessage,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to execute request.");
    } finally {
      setIsExecutingApiPreview(false);
    }
  };

  const handleSave = async (andRun: boolean) => {
    setError(null);
    if (!title.trim()) {
      setError("Test title is required.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        type: testType,
      };

      if (testType === "API") {
        payload.apiConfig = apiSpec;
      } else if (testType === "ACCESSIBILITY") {
        payload.a11yConfig = a11ySpec;
      } else if (testType === "PERFORMANCE") {
        payload.perfConfig = perfSpec;
      } else if (testType === "SEO") {
        payload.seoConfig = seoSpec;
      } else {
        payload.steps = steps;
      }

      const res = await fetch(`/api/projects/${projectId}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create test.");
      }

      const testId = data.test.id;

      if (andRun) {
        // Trigger execution immediately
        const runRes = await fetch(`/api/tests/${testId}/run`, {
          method: "POST",
        });
        const runData = await runRes.json();
        if (!runRes.ok) {
          throw new Error(runData.error || "Failed to run test.");
        }
      }

      router.push(`/dashboard/tests/${testId}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create test.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href={`/dashboard/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Project
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileCode2 className="w-6 h-6 text-brand-400" />
            Create Automated Test
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Author browser automation workflows or high-throughput REST API endpoint tests.
          </p>
        </div>

        {/* Test Type Switcher & Presets */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {testType === "UI" ? (
            <>
              <button
                type="button"
                onClick={() => setShowRecorder(!showRecorder)}
                className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                {showRecorder ? "Hide Recorder" : "Record Test"}
              </button>

              <button
                type="button"
                onClick={loadHomepagePreset}
                className="px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-semibold text-xs border border-brand-500/30 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                UI Preset
              </button>
            </>
          ) : testType === "API" ? (
            <button
              type="button"
              onClick={loadApiPreset}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              API Preset
            </button>
          ) : testType === "ACCESSIBILITY" ? (
            <button
              type="button"
              onClick={loadA11yPreset}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs border border-amber-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              A11y Preset
            </button>
          ) : testType === "PERFORMANCE" ? (
            <button
              type="button"
              onClick={loadPerformancePreset}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold text-xs border border-purple-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Perf Preset
            </button>
          ) : (
            <button
              type="button"
              onClick={loadSeoPreset}
              className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-semibold text-xs border border-teal-500/30 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              SEO Preset
            </button>
          )}
        </div>
      </div>

      {showRecorder && testType === "UI" && (
        <TestRecorder
          projectId={projectId}
          defaultUrl={projectBaseUrl}
          onStepsGenerated={handleStepsGenerated}
          onCancel={() => setShowRecorder(false)}
        />
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Test Meta & Type Selector */}
      <div className="p-6 rounded-2xl glass-panel-elevated border border-white/[0.08] space-y-4">
        {/* Type Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2">Test Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => setTestType("UI")}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                testType === "UI"
                  ? "bg-brand-500/15 border-brand-500/40 text-white"
                  : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
              }`}
            >
              <FileCode2 className={`w-5 h-5 shrink-0 ${testType === "UI" ? "text-brand-400" : "text-zinc-500"}`} />
              <div>
                <div className="text-xs font-bold">Browser / UI</div>
                <div className="text-[11px] text-zinc-400">Playwright workflow</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTestType("API")}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                testType === "API"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-white"
                  : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
              }`}
            >
              <Globe2 className={`w-5 h-5 shrink-0 ${testType === "API" ? "text-emerald-400" : "text-zinc-500"}`} />
              <div>
                <div className="text-xs font-bold">API Test</div>
                <div className="text-[11px] text-zinc-400">HTTP REST assertions</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTestType("ACCESSIBILITY")}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                testType === "ACCESSIBILITY"
                  ? "bg-amber-500/15 border-amber-500/40 text-white"
                  : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
              }`}
            >
              <Eye className={`w-5 h-5 shrink-0 ${testType === "ACCESSIBILITY" ? "text-amber-400" : "text-zinc-500"}`} />
              <div>
                <div className="text-xs font-bold">Accessibility</div>
                <div className="text-[11px] text-zinc-400">axe-core WCAG scan</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTestType("PERFORMANCE")}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                testType === "PERFORMANCE"
                  ? "bg-purple-500/15 border-purple-500/40 text-white"
                  : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
              }`}
            >
              <Zap className={`w-5 h-5 shrink-0 ${testType === "PERFORMANCE" ? "text-purple-400" : "text-zinc-500"}`} />
              <div>
                <div className="text-xs font-bold">Performance</div>
                <div className="text-[11px] text-zinc-400">Core Web Vitals</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTestType("SEO")}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                testType === "SEO"
                  ? "bg-teal-500/15 border-teal-500/40 text-white"
                  : "bg-black/30 border-white/[0.06] text-zinc-400 hover:text-white"
              }`}
            >
              <Search className={`w-5 h-5 shrink-0 ${testType === "SEO" ? "text-teal-400" : "text-zinc-500"}`} />
              <div>
                <div className="text-xs font-bold">SEO Audit</div>
                <div className="text-[11px] text-zinc-400">Technical crawlability</div>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Test Title <span className="text-rose-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              testType === "API"
                ? "e.g. GET /api/v1/users"
                : testType === "ACCESSIBILITY"
                ? "e.g. Homepage WCAG Audit"
                : testType === "PERFORMANCE"
                ? "e.g. Homepage Core Web Vitals"
                : testType === "SEO"
                ? "e.g. Homepage Technical SEO Audit"
                : "e.g. Homepage loads"
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Description <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief explanation of test intent"
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* MODE 1: API Request Builder */}
      {testType === "API" && (
        <div className="space-y-6">
          <ApiRequestBuilder
            initialSpec={apiSpec}
            baseUrl={projectBaseUrl}
            onChange={(updated) => setApiSpec(updated)}
            onSendTest={handleDirectApiTest}
            isExecuting={isExecutingApiPreview}
          />

          {/* Response Viewer if executed preview */}
          {apiPreviewResult && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Live Response Preview
              </h3>
              <ApiResponseViewer result={apiPreviewResult} />
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Accessibility Config Section */}
      {testType === "ACCESSIBILITY" && (
        <A11yTestConfig
          initialSpec={a11ySpec}
          baseUrl={projectBaseUrl}
          onChange={(updated) => setA11ySpec(updated)}
        />
      )}

      {/* MODE 3: Performance Config Section */}
      {testType === "PERFORMANCE" && (
        <PerformanceTestConfig
          initialSpec={perfSpec}
          baseUrl={projectBaseUrl}
          onChange={(updated) => setPerfSpec(updated)}
        />
      )}

      {/* MODE 4: SEO Config Section */}
      {testType === "SEO" && (
        <SeoTestConfig
          spec={seoSpec}
          onChange={(updated) => setSeoSpec(updated)}
        />
      )}

      {/* MODE 5: UI Step Builder Section */}
      {testType === "UI" && (
        <div className="p-6 rounded-2xl glass-panel-elevated border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Execution Steps ({steps.length})
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">
              Executed sequentially in headless Chromium
            </span>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-white/[0.06] text-zinc-300 font-mono text-[11px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold uppercase text-brand-400">
                      {step.action}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
                    aria-label={`Remove step ${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Dynamic Action Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                  {/* Target Field */}
                  {(step.action === "goto" ||
                    step.action === "click" ||
                    step.action === "fill" ||
                    step.action === "press" ||
                    step.action === "wait" ||
                    step.action === "assert_url" ||
                    step.action === "assert_text" ||
                    step.action === "assert_visible") && (
                    <div
                      className={
                        step.action === "fill" || step.action === "assert_text"
                          ? "sm:col-span-7"
                          : "sm:col-span-12"
                      }
                    >
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                        {step.action === "goto" && "Target URL"}
                        {step.action === "click" && "Selector to Click (e.g. button or [data-testid='...'])"}
                        {step.action === "fill" && "Target Input Selector"}
                        {step.action === "press" && "Key to Press (e.g. Enter, Escape)"}
                        {step.action === "wait" && "Wait duration (ms) or Selector"}
                        {step.action === "assert_url" && "URL substring expected"}
                        {step.action === "assert_text" && "Target Element Selector"}
                        {step.action === "assert_visible" && "Element Selector to Verify Visible"}
                      </label>
                      <input
                        type="text"
                        value={step.target || ""}
                        onChange={(e) => updateStep(idx, "target", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  )}

                  {/* Value Field */}
                  {(step.action === "fill" ||
                    step.action === "assert_text" ||
                    step.action === "screenshot") && (
                    <div
                      className={
                        step.action === "fill" || step.action === "assert_text"
                          ? "sm:col-span-5"
                          : "sm:col-span-12"
                      }
                    >
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                        {step.action === "fill" && "Text to Type"}
                        {step.action === "assert_text" && "Expected Text Content"}
                        {step.action === "screenshot" && "Screenshot Name (e.g. homepage_loaded)"}
                      </label>
                      <input
                        type="text"
                        value={step.value || ""}
                        onChange={(e) => updateStep(idx, "value", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Step Action Palette */}
          <div className="pt-2">
            <span className="block text-xs font-mono text-zinc-400 mb-2">Add Step:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addStep("goto")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] transition-colors"
              >
                + goto URL
              </button>
              <button
                type="button"
                onClick={() => addStep("click")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] transition-colors"
              >
                + click
              </button>
              <button
                type="button"
                onClick={() => addStep("fill")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] transition-colors"
              >
                + fill
              </button>
              <button
                type="button"
                onClick={() => addStep("press")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] transition-colors"
              >
                + press key
              </button>
              <button
                type="button"
                onClick={() => addStep("wait")}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] transition-colors"
              >
                + wait
              </button>
              <button
                type="button"
                onClick={() => addStep("screenshot")}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-mono text-cyan-300 border border-cyan-500/20 transition-colors"
              >
                + screenshot
              </button>
              <button
                type="button"
                onClick={() => addStep("assert_visible")}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 border border-emerald-500/20 transition-colors"
              >
                + assert visible
              </button>
              <button
                type="button"
                onClick={() => addStep("assert_text")}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 border border-emerald-500/20 transition-colors"
              >
                + assert text
              </button>
              <button
                type="button"
                onClick={() => addStep("assert_url")}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 border border-emerald-500/20 transition-colors"
              >
                + assert URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 font-medium text-xs transition-colors"
        >
          Cancel
        </Link>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSave(false)}
          className="px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-bold text-xs transition-colors flex items-center gap-1.5 border border-white/[0.1] disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          Save Test
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSave(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-brand-500/20 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Executing Test...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Save &amp; Run Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}
