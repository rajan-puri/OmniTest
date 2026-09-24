"use client";

import React, { useState, useEffect } from "react";
import { Container } from "../primitives/Container";
import { Button } from "../primitives/Button";
import { MockWindow } from "../primitives/MockWindow";
import { CountUp } from "../primitives/CountUp";
import { StatusPill } from "../primitives/StatusPill";

const MARQUEE_ITEMS = [
  "Playwright E2E",
  "WCAG 2.2 A11y (axe-core)",
  "Visual Pixel Regression",
  "OpenAPI Contract Tests",
  "Core Web Vitals (Lighthouse)",
  "Security Headers",
  "DOM Snapshot Diffs",
  "Automated HAR Tracing",
];

export const PrecisionHero: React.FC = () => {
  const [typedSelector, setTypedSelector] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 38, y: 52 });
  const [isClicking, setIsClicking] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Selector typing and cursor loop
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const fullText = "getByRole('button', { name: 'Checkout' }).click();";

    const runSequence = () => {
      setTypedSelector("");
      setTestPassed(false);
      setIsClicking(false);
      setCursorPos({ x: 15, y: 25 });

      // Move cursor to checkout button
      timeoutId = setTimeout(() => {
        setCursorPos({ x: 62, y: 64 });

        // Start typing selector
        timeoutId = setTimeout(() => {
          let charIdx = 0;
          const typingInterval = setInterval(() => {
            if (charIdx <= fullText.length) {
              setTypedSelector(fullText.slice(0, charIdx));
              charIdx++;
            } else {
              clearInterval(typingInterval);
              // Click element
              setIsClicking(true);
              timeoutId = setTimeout(() => {
                setIsClicking(false);
                setTestPassed(true);
                // Wait and reset loop
                timeoutId = setTimeout(runSequence, 4500);
              }, 400);
            }
          }, 35);
        }, 600);
      }, 700);
    };

    runSequence();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("npm i -g omnitest");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen pt-24 pb-12 flex flex-col justify-between bg-[#0E0D0B] text-[#F5F3EE] blueprint-grid border-b border-white/[0.08] overflow-hidden"
    >
      <Container className="my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: ~8 cols on lg */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col z-10">
            {/* Engine status indicator */}
            <div className="inline-flex items-center gap-2 mb-6 font-mono text-[12px] text-[#A29E94]">
              <span className="w-2 h-2 rounded-full bg-[#00E58F] animate-pulse" />
              <span className="uppercase tracking-widest text-[#00E58F] font-semibold">
                OMNITEST ENGINE V2.4
              </span>
              <span className="text-white/20">|</span>
              <span className="text-[#6B675E]">CLOUD MATRIX</span>
            </div>

            {/* Headline max 6 words */}
            <h1 className="text-[clamp(2.75rem,6.5vw,6.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#F5F3EE] mb-6">
              Every test.
              <br />
              <span className="text-[#00E58F]">One single run.</span>
            </h1>

            {/* One short sentence */}
            <p className="text-[17px] md:text-[18px] text-[#A29E94] leading-relaxed max-w-xl mb-8">
              Execute Playwright E2E workflows, API contracts, visual diffs, and
              accessibility audits in one parallel cloud grid.
            </p>

            {/* CTA Buttons & copy snippet */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Button href="/dashboard" variant="primary" size="lg" magnetic>
                Start testing free
              </Button>
              <Button href="#dashboard" variant="outline" size="lg" magnetic>
                Inspect live run
              </Button>

              <button
                type="button"
                onClick={handleCopyInstall}
                className="h-[54px] min-h-[48px] px-4 rounded-[6px] border border-white/[0.12] bg-[#161512] hover:border-white/[0.24] flex items-center gap-2.5 font-mono text-[13px] text-[#A29E94] hover:text-[#F5F3EE] transition-all"
                aria-label="npm i -g omnitest, copy installation command"
              >
                <span className="text-[#00E58F] select-none">$</span>
                <span>npm i -g omnitest</span>
                <span className="text-[11px] text-[#6B675E] uppercase ml-1">
                  {copied ? "COPIED!" : "COPY"}
                </span>
              </button>
            </div>

            {/* Quick stats row with CountUp */}
            <div className="pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <div className="text-[26px] md:text-[32px] font-bold font-mono text-[#F5F3EE] tracking-tight">
                  <CountUp end={142} suffix="/142" duration={1.5} />
                </div>
                <div className="text-[12px] font-mono text-[#6B675E] uppercase tracking-wider">
                  TESTS PASSED
                </div>
              </div>
              <div>
                <div className="text-[26px] md:text-[32px] font-bold font-mono text-[#00E58F] tracking-tight">
                  <CountUp end={180} suffix="ms" duration={1.2} />
                </div>
                <div className="text-[12px] font-mono text-[#6B675E] uppercase tracking-wider">
                  COLD WORKER BOOT
                </div>
              </div>
              <div>
                <div className="text-[26px] md:text-[32px] font-bold font-mono text-[#F5F3EE] tracking-tight">
                  <CountUp end={0} suffix=" FLAKES" duration={0.8} />
                </div>
                <div className="text-[12px] font-mono text-[#6B675E] uppercase tracking-wider">
                  ZERO RETRIES
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: LARGE browser mockup overlapping right on desktop */}
          <div className="lg:col-span-6 xl:col-span-5 relative w-full">
            <div className="w-full lg:w-[130%] xl:w-[145%] lg:-mr-[30%] xl:-mr-[45%]">
              <MockWindow
                title="chromium --remote-debugging-port=9222"
                badge={testPassed ? "TEST PASSED" : "LOCATING"}
                badgeVariant={testPassed ? "mint" : "warn"}
                telemetry={
                  <span className="font-mono text-[12px] text-[#6B675E] tabular-nums">
                    STEP 04/08
                  </span>
                }
                bodyClassName="bg-[#12110E] p-0"
              >
                {/* Simulated Target Web App */}
                <div className="relative p-6 bg-[#0E0D0B] border-b border-white/[0.08] min-h-[300px] flex flex-col justify-between overflow-hidden">
                  {/* Mock Navigation */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-[3px] bg-[#00E58F]" />
                      <span className="font-mono text-[13px] font-semibold text-[#F5F3EE]">
                        AcmeStore.dev
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] font-mono text-[#6B675E]">
                      <span>CART (2)</span>
                      <span>$149.00</span>
                    </div>
                  </div>

                  {/* Mock Cart Card */}
                  <div className="my-6 p-4 rounded-[6px] border border-white/[0.08] bg-[#161512] flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[14px] text-[#F5F3EE] font-medium">
                        Developer Cloud Node Pro
                      </div>
                      <div className="font-mono text-[12px] text-[#A29E94]">
                        Qty: 1 × Annual Billing
                      </div>
                    </div>
                    <div className="font-mono text-[15px] font-bold text-[#00E58F]">
                      $149.00
                    </div>
                  </div>

                  {/* Target Checkout Button with bounding box */}
                  <div className="flex items-center justify-end">
                    <div
                      className={`relative px-6 py-3 rounded-[6px] font-mono text-[14px] font-bold transition-all duration-200 select-none ${
                        isClicking
                          ? "bg-[#00F098] scale-95"
                          : "bg-[#00E58F] text-[#0E0D0B]"
                      } ${
                        typedSelector
                          ? "ring-2 ring-[#00E58F] ring-offset-2 ring-offset-[#0E0D0B]"
                          : ""
                      }`}
                    >
                      <span>Complete Checkout →</span>
                      {typedSelector && (
                        <div className="absolute -top-7 right-0 font-mono text-[11px] bg-[#161512] border border-[#00E58F] text-[#00E58F] px-1.5 py-0.5 rounded-[4px] whitespace-nowrap shadow-sm">
                          role=&apos;button&apos; name=&apos;Checkout&apos;
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Animated Simulated Cursor */}
                  <div
                    className="absolute pointer-events-none transition-all duration-500 ease-out z-30"
                    style={{
                      left: `${cursorPos.x}%`,
                      top: `${cursorPos.y}%`,
                    }}
                  >
                    <svg
                      className={`w-5 h-5 text-[#00E58F] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform ${
                        isClicking ? "scale-75" : "scale-100"
                      }`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4 0l16 12.279-6.951 1.17 4.325 8.817-3.596 1.734-4.35-8.879-5.428 5.428v-20.549z" />
                    </svg>
                  </div>
                </div>

                {/* Live Selector & Assertion Console Output */}
                <div className="p-4 bg-[#161512] font-mono text-[13px] space-y-2 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between text-[#6B675E] text-[11px] uppercase tracking-wider pb-1 border-b border-white/[0.06]">
                    <span>AUTOMATED SELECTOR RESOLUTION</span>
                    <span className="text-[#00E58F]">DOM AGENT</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#00E58F] select-none">&gt;</span>
                    <span className="text-[#38BDF8]">page.</span>
                    <span className="text-[#F5F3EE]">
                      {typedSelector || <span className="text-[#6B675E]">locating...</span>}
                    </span>
                    <span className="w-2 h-4 bg-[#00E58F] inline-block animate-pulse -mb-0.5" />
                  </div>

                  {testPassed && (
                    <div className="pt-2 flex items-center justify-between text-[12px] border-t border-white/[0.06] animate-pass-tick">
                      <div className="flex items-center gap-2 text-[#00E58F]">
                        <svg
                          className="w-4 h-4 text-[#00E58F]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>expect(page).toHaveURL(&apos;/order/confirmation&apos;)</span>
                      </div>
                      <span className="text-[#6B675E] tabular-nums">42ms</span>
                    </div>
                  )}
                </div>
              </MockWindow>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Marquee Strip of Check Types */}
      <div className="w-full border-t border-white/[0.08] bg-[#12110E] py-3 overflow-hidden select-none">
        <div className="flex items-center gap-8 whitespace-nowrap animate-[marquee_25s_linear_infinite]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 font-mono text-[13px] text-[#A29E94]">
              <svg
                className="w-3.5 h-3.5 text-[#00E58F]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{item}</span>
              <span className="text-white/10 ml-4 font-mono">/</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
