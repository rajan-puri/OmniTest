"use client";

import React, { useState, useEffect } from "react";
import { Container } from "../primitives/Container";
import { CountUp } from "../primitives/CountUp";

export const PrecisionBento: React.FC = () => {
  // Recorder tile live typing state
  const [recordedLines, setRecordedLines] = useState<string[]>([
    "await page.goto('https://app.dev/login');",
  ]);

  // Accessibility violation countdown
  const [violations, setViolations] = useState(14);

  // Security checks sequential ticks
  const [securityStep, setSecurityStep] = useState(0);

  // Loop small animations that explain each feature
  useEffect(() => {
    // Recorder loop
    const recorderSteps = [
      "await page.goto('https://app.dev/login');",
      "await page.getByPlaceholder('Email').fill('dev@corp.io');",
      "await page.getByRole('button', { name: 'Log in' }).click();",
      "await expect(page).toHaveURL('/dashboard');",
    ];

    let recIdx = 1;
    const recInterval = setInterval(() => {
      setRecordedLines(recorderSteps.slice(0, recIdx + 1));
      recIdx = (recIdx + 1) % recorderSteps.length;
    }, 1800);

    // Accessibility count down loop
    const a11yInterval = setInterval(() => {
      setViolations((prev) => (prev > 0 ? prev - 1 : 14));
    }, 400);

    // Security tick sequence loop
    const secInterval = setInterval(() => {
      setSecurityStep((prev) => (prev + 1) % 5);
    }, 1200);

    return () => {
      clearInterval(recInterval);
      clearInterval(a11yInterval);
      clearInterval(secInterval);
    };
  }, []);

  return (
    <section
      id="capabilities"
      className="relative w-full py-[clamp(96px,14vw,176px)] bg-[#0E0D0B] text-[#F5F3EE] blueprint-grid border-b border-white/[0.08]"
    >
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="font-mono text-[12px] text-[#A29E94] uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E58F]" />
            <span>CAPABILITY ARCHITECTURE</span>
          </div>
          <h2 className="text-[clamp(2rem,4.5vw,3.75rem)] font-extrabold tracking-tight text-[#F5F3EE] leading-[1.08]">
            Full-spectrum quality assurance in one runtime.
          </h2>
          <p className="mt-4 text-[17px] text-[#A29E94] max-w-2xl leading-relaxed">
            Every test type shares the same execution context, network state,
            and reporting pipeline. No secondary plugins required.
          </p>
        </div>

        {/* 12-Col Asymmetric Bento Grid (7/5, 4/4/4, 5/7) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* ================= ROW 1: SPAN 7 / 5 ================= */}

          {/* Tile 1 (Span 7): Live Code-Gen Recorder */}
          <div className="md:col-span-7 rounded-[6px] border border-white/[0.08] bg-[#161512] p-6 md:p-8 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] text-[12px] font-mono">
                <span className="text-[#00E58F] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00E58F] animate-pulse" />
                  LIVE SPEC RECORDER
                </span>
                <span className="text-[#6B675E]">AUTO-LOCATOR ENGINE</span>
              </div>

              {/* Code Generator Display */}
              <div className="my-6 p-4 rounded-[6px] border border-white/[0.08] bg-[#12110E] font-mono text-[14px] leading-relaxed space-y-2 min-h-[170px]">
                <div className="text-[#8E8A80]">{"// Generating resilient Playwright locators:"}</div>
                {recordedLines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[#F5F3EE]">
                    <span className="text-[#00E58F] select-none text-[12px]">{idx + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 text-[12px] text-[#00E58F] pt-1">
                  <span className="w-1.5 h-3 bg-[#00E58F] animate-pulse inline-block" />
                  <span className="text-[#A29E94]">listening for browser events...</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <div className="text-[17px] font-bold text-[#F5F3EE]">
                Zero-friction test authoring.
              </div>
              <p className="text-[14px] text-[#A29E94] mt-1">
                Record real browser interactions directly into human-readable TypeScript specs.
              </p>
            </div>
          </div>

          {/* Tile 2 (Span 5): Accessibility (axe-core WCAG 2.2 AA) */}
          <div className="md:col-span-5 rounded-[6px] border border-white/[0.08] bg-[#161512] p-6 md:p-8 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] text-[12px] font-mono">
                <span className="text-[#A29E94]">AXE-CORE V4.9</span>
                <span className="text-[#00E58F] font-bold">WCAG 2.2 AA</span>
              </div>

              <div className="my-6 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[54px] md:text-[64px] font-black text-[#F5F3EE] tabular-nums leading-none">
                    {violations}
                  </div>
                  <div className="font-mono text-[12px] text-[#6B675E] uppercase tracking-wider mt-1">
                    ACTIVE VIOLATIONS
                  </div>
                </div>

                <div className="space-y-1.5 font-mono text-[12px] text-right">
                  <div className="text-[#00E58F] flex items-center justify-end gap-1.5">
                    <span>Contrast Ratio 4.5:1</span>
                    <span className="font-bold">PASS</span>
                  </div>
                  <div className="text-[#00E58F] flex items-center justify-end gap-1.5">
                    <span>ARIA Role Hierarchy</span>
                    <span className="font-bold">PASS</span>
                  </div>
                  <div className="text-[#00E58F] flex items-center justify-end gap-1.5">
                    <span>Keyboard Focus Trap</span>
                    <span className="font-bold">PASS</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <div className="text-[17px] font-bold text-[#F5F3EE]">
                Autonomous WCAG 2.2 compliance.
              </div>
              <p className="text-[14px] text-[#A29E94] mt-1">
                Integrated axe-core audit engine blocks accessibility regressions before merge.
              </p>
            </div>
          </div>

          {/* ================= ROW 2: SPAN 4 / 4 / 4 ================= */}

          {/* Tile 3 (Span 4): Web Vitals & Lighthouse */}
          <div className="md:col-span-4 rounded-[6px] border border-white/[0.08] bg-[#161512] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-[12px] font-mono text-[#A29E94]">
                <span>CORE WEB VITALS</span>
                <span className="text-[#00E58F] font-semibold">LIGHTHOUSE 11</span>
              </div>

              <div className="my-5 grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2.5 rounded-[4px] border border-white/[0.08] bg-[#12110E]">
                  <div className="text-[20px] font-bold text-[#00E58F]">0.8s</div>
                  <div className="text-[10px] text-[#6B675E] uppercase mt-0.5">LCP (99)</div>
                </div>
                <div className="p-2.5 rounded-[4px] border border-white/[0.08] bg-[#12110E]">
                  <div className="text-[20px] font-bold text-[#00E58F]">12ms</div>
                  <div className="text-[10px] text-[#6B675E] uppercase mt-0.5">FID (100)</div>
                </div>
                <div className="p-2.5 rounded-[4px] border border-white/[0.08] bg-[#12110E]">
                  <div className="text-[20px] font-bold text-[#00E58F]">0.01</div>
                  <div className="text-[10px] text-[#6B675E] uppercase mt-0.5">CLS (98)</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08]">
              <div className="text-[15px] font-bold text-[#F5F3EE]">
                Real user performance monitoring.
              </div>
              <p className="text-[13px] text-[#A29E94] mt-1">
                Lighthouse performance and vital metrics tracked against baseline thresholds.
              </p>
            </div>
          </div>

          {/* Tile 4 (Span 4): API Contract Validation */}
          <div className="md:col-span-4 rounded-[6px] border border-white/[0.08] bg-[#161512] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-[12px] font-mono text-[#A29E94]">
                <span>API CONTRACTS</span>
                <span className="text-[#38BDF8] font-semibold">OPENAPI 3.1</span>
              </div>

              <div className="my-5 p-3 rounded-[4px] border border-white/[0.08] bg-[#12110E] font-mono text-[12px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#38BDF8]">GET /api/v2/orders</span>
                  <span className="text-[#00E58F] font-bold">200 OK</span>
                </div>
                <div className="text-[#6B675E] text-[11px] truncate">
                  ✓ Schema match: OrderSchema.strict()
                </div>
                <div className="text-[#00E58F] text-[11px]">
                  ✓ Latency: 28ms &lt; 150ms budget
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08]">
              <div className="text-[15px] font-bold text-[#F5F3EE]">
                Type-safe API contract testing.
              </div>
              <p className="text-[13px] text-[#A29E94] mt-1">
                Validate REST and GraphQL payload contracts against OpenAPI definitions.
              </p>
            </div>
          </div>

          {/* Tile 5 (Span 4): Security & SEO */}
          <div className="md:col-span-4 rounded-[6px] border border-white/[0.08] bg-[#161512] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-[12px] font-mono text-[#A29E94]">
                <span>SECURITY &amp; SEO</span>
                <span className="text-[#00E58F] font-semibold">OWASP VERIFIED</span>
              </div>

              <div className="my-5 space-y-1.5 font-mono text-[12px]">
                {[
                  { name: "Content-Security-Policy", ok: securityStep >= 1 },
                  { name: "HSTS Strict-Transport", ok: securityStep >= 2 },
                  { name: "Sitemap & Canonical Link", ok: securityStep >= 3 },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-[4px] border border-white/[0.06] bg-[#12110E] flex items-center justify-between"
                  >
                    <span className="text-[#F5F3EE] truncate">{item.name}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        item.ok ? "text-[#00E58F]" : "text-[#6B675E]"
                      }`}
                    >
                      {item.ok ? "ENFORCED" : "CHECKING"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08]">
              <div className="text-[15px] font-bold text-[#F5F3EE]">
                Automated security compliance.
              </div>
              <p className="text-[13px] text-[#A29E94] mt-1">
                Automated verification of transport security, meta schemas, and crawlability.
              </p>
            </div>
          </div>

          {/* ================= ROW 3: SPAN 5 / 7 ================= */}

          {/* Tile 6 (Span 5): Smart Flake Isolation */}
          <div className="md:col-span-5 rounded-[6px] border border-white/[0.08] bg-[#161512] p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] text-[12px] font-mono text-[#A29E94]">
                <span>HEURISTIC ENGINE</span>
                <span className="text-[#00E58F] font-semibold">ZERO-RETRY PASS</span>
              </div>

              <div className="my-6">
                <div className="font-mono text-[48px] md:text-[56px] font-black text-[#00E58F] tabular-nums leading-none">
                  99.98%
                </div>
                <div className="font-mono text-[12px] text-[#6B675E] uppercase tracking-wider mt-1">
                  SUITE STABILITY CONFIDENCE
                </div>
                <p className="mt-3 text-[14px] text-[#A29E94] font-mono">
                  Autonomous quarantine tags flakiness caused by external DOM mutations without stalling pull requests.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <div className="text-[17px] font-bold text-[#F5F3EE]">
                Flakiness quarantine.
              </div>
              <p className="text-[14px] text-[#A29E94] mt-1">
                Isolate flaky selectors and transient network errors with telemetry heuristics.
              </p>
            </div>
          </div>

          {/* Tile 7 (Span 7): Distributed Cloud Grid */}
          <div className="md:col-span-7 rounded-[6px] border border-white/[0.08] bg-[#161512] p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] text-[12px] font-mono text-[#A29E94]">
                <span>PARALLEL GRID</span>
                <span className="text-[#00E58F] font-semibold">EPHEMERAL PODS</span>
              </div>

              <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[12px]">
                {["CHROMIUM 128", "FIREFOX 130", "WEBKIT 18.0", "NODE API V22"].map((worker, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-[6px] border border-white/[0.08] bg-[#12110E] flex flex-col justify-between h-24"
                  >
                    <span className="text-[#6B675E] text-[10px]">POD 0{i + 1}</span>
                    <span className="text-[#F5F3EE] font-bold text-[13px]">{worker}</span>
                    <span className="text-[#00E58F] text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E58F]" />
                      READY
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <div className="text-[17px] font-bold text-[#F5F3EE]">
                Massively parallel cloud orchestrator.
              </div>
              <p className="text-[14px] text-[#A29E94] mt-1">
                Scale from 1 to 64 parallel browser instances in isolated ephemeral pods.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
