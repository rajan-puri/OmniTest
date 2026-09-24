"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "../primitives/Container";
import { Button } from "../primitives/Button";

export const PrecisionFinalCta: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [typedAssertion, setTypedAssertion] = useState("");

  const command = "npx omnitest init && npx omnitest run";
  const fullAssertion = "assert(app.isProductionReady).toBe(true);";

  // Typing effect for assert line
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const runTyping = () => {
      setTypedAssertion("");
      let idx = 0;
      const interval = setInterval(() => {
        if (idx <= fullAssertion.length) {
          setTypedAssertion(fullAssertion.slice(0, idx));
          idx++;
        } else {
          clearInterval(interval);
          timeoutId = setTimeout(runTyping, 4000);
        }
      }, 45);
    };

    runTyping();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="final-cta"
      className="relative w-full pt-[clamp(96px,14vw,176px)] pb-12 bg-[#0E0D0B] text-[#F5F3EE] blueprint-grid overflow-hidden border-t border-white/[0.08]"
    >
      <Container>
        {/* Giant Type Headline */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6 font-mono text-[12px] text-[#00E58F]">
            <span className="w-2 h-2 rounded-full bg-[#00E58F] animate-pulse" />
            <span className="uppercase tracking-widest font-semibold">GET STARTED IN SECONDS</span>
          </div>

          <h2 className="text-[clamp(2.5rem,6.5vw,5.5rem)] font-extrabold tracking-[-0.035em] leading-[1.02] text-[#F5F3EE]">
            Run your first test in two minutes.
          </h2>

          <p className="mt-6 text-[18px] md:text-[20px] text-[#A29E94] max-w-xl mx-auto leading-relaxed">
            Eliminate tool fragmentation today. Zero configuration required to execute
            your existing Playwright or Cypress specs.
          </p>

          {/* Typing Assertion Line */}
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-[6px] border border-white/[0.1] bg-[#161512] font-mono text-[14px] md:text-[15px] text-[#A29E94]">
            <span className="text-[#00E58F] select-none">&gt;&gt;</span>
            <span className="text-[#F5F3EE]">
              {typedAssertion}
              <span className="w-2 h-4 bg-[#00E58F] inline-block animate-pulse ml-1 -mb-0.5" />
            </span>
          </div>

          {/* Copyable Terminal Command */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="h-[54px] min-h-[48px] px-5 rounded-[6px] border border-white/[0.12] bg-[#161512] flex items-center justify-between gap-4 font-mono text-[14px] text-[#F5F3EE] w-full max-w-md">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[#00E58F] select-none">$</span>
                <span className="truncate">{command}</span>
              </div>
              <button
                onClick={handleCopy}
                type="button"
                className="px-3 py-1 rounded-[4px] border border-white/[0.1] hover:border-white/[0.25] text-[11px] uppercase tracking-wider text-[#A29E94] hover:text-[#F5F3EE] shrink-0 transition-colors"
                aria-label="COPY npx omnitest command"
              >
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>

            <Button href="/dashboard" variant="primary" size="lg" magnetic>
              Deploy Cluster
            </Button>
          </div>
        </div>

        {/* Slim Technical Footer */}
        <footer className="mt-24 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-[12px] text-[#6B675E]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-[4px] bg-[#161512] border border-white/[0.1] flex items-center justify-center font-mono font-bold text-[#00E58F] text-[12px]">
              Ω
            </div>
            <span>© 2026 OmniTest Systems, Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E58F]" />
            <span className="text-[#A29E94]">GLOBAL GRID: 99.98% OPERATIONAL</span>
          </div>

          <div className="flex items-center gap-6 text-[#A29E94]">
            <Link href="/dashboard" className="hover:text-[#F5F3EE] transition-colors">
              Documentation
            </Link>
            <Link href="/dashboard" className="hover:text-[#F5F3EE] transition-colors">
              Changelog
            </Link>
            <Link href="/dashboard" className="hover:text-[#F5F3EE] transition-colors">
              API
            </Link>
            <Link href="/dashboard" className="hover:text-[#F5F3EE] transition-colors">
              GitHub
            </Link>
            <Link href="/dashboard" className="hover:text-[#F5F3EE] transition-colors">
              Privacy
            </Link>
          </div>
        </footer>
      </Container>
    </section>
  );
};
