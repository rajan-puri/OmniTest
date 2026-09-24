"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "../primitives/Container";
import { Button } from "../primitives/Button";

export const EditorialFooterSection: React.FC = () => {
  const [typedCode, setTypedCode] = useState("");
  const fullCode = "assert(app.isProductionReady).toBe(true);";

  // Typing effect loop
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const runTyping = () => {
      setTypedCode("");
      let idx = 0;
      const interval = setInterval(() => {
        if (idx <= fullCode.length) {
          setTypedCode(fullCode.slice(0, idx));
          idx++;
        } else {
          clearInterval(interval);
          timeoutId = setTimeout(runTyping, 4000);
        }
      }, 50);
    };

    runTyping();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="w-full bg-[#EAF6F1] text-[#0E1719] border-t border-[#0E9F6E]/15 overflow-hidden">
      {/* ================= SECTION 11: "READY TO START?" ================= */}
      <section className="py-[clamp(80px,11vw,144px)] paper-grid border-b border-[#0E9F6E]/15">
        <Container className="text-center flex flex-col items-center">
          <div className="font-mono text-[12px] font-bold text-[#0E9F6E] uppercase tracking-wider mb-4">
            START BUILDING CONFIDENCE
          </div>

          <h2 className="text-[clamp(2.5rem,5.5vw,4.75rem)] font-extrabold tracking-tight text-[#0E1719] leading-[1.05] max-w-3xl">
            Ready to eliminate testing tool sprawl?
          </h2>

          <p className="mt-4 text-[18px] md:text-[20px] text-[#5B6668] max-w-xl mx-auto leading-relaxed">
            Run your first parallel Playwright workflow, visual diff, and accessibility audit in two minutes.
          </p>

          {/* Typing Assertion Line */}
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-[4px] border border-[#0E9F6E]/20 bg-white font-mono text-[14px] md:text-[15px] text-[#0E1719] shadow-xs">
            <span className="text-[#0E9F6E] select-none font-bold">&gt;&gt;</span>
            <span>{typedCode}</span>
            <span className="w-2 h-4 bg-[#0E9F6E] inline-block animate-pulse -mb-0.5" />
          </div>

          {/* Two Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="/dashboard" variant="primary" size="lg">
              Start testing free
            </Button>
            <Button href="#pricing" variant="outline" size="lg">
              Book a platform demo
            </Button>
          </div>
        </Container>
      </section>

      {/* ================= SECTION 12: 5-COLUMN FOOTER ================= */}
      <footer className="pt-16 pb-8">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-16 border-b border-[#0E9F6E]/15 text-[14px]">
            {/* Column 1: Product */}
            <div className="space-y-3">
              <div className="font-sans font-bold text-[13px] text-[#0E1719] uppercase tracking-wider">
                Product
              </div>
              <ul className="space-y-2 text-[#5B6668]">
                <li><Link href="#features" className="hover:text-[#0E1719]">Browser E2E</Link></li>
                <li><Link href="#features" className="hover:text-[#0E1719]">Visual Diff Slider</Link></li>
                <li><Link href="#features" className="hover:text-[#0E1719]">Accessibility Audits</Link></li>
                <li><Link href="#features" className="hover:text-[#0E1719]">API Contract Tests</Link></li>
                <li><Link href="#features" className="hover:text-[#0E1719]">Core Web Vitals</Link></li>
                <li><Link href="#features" className="hover:text-[#0E1719]">Changelog</Link></li>
              </ul>
            </div>

            {/* Column 2: Platform */}
            <div className="space-y-3">
              <div className="font-sans font-bold text-[13px] text-[#0E1719] uppercase tracking-wider">
                Platform
              </div>
              <ul className="space-y-2 text-[#5B6668]">
                <li><Link href="#how-it-works" className="hover:text-[#0E1719]">Cloud Worker Grid</Link></li>
                <li><Link href="#chapters" className="hover:text-[#0E1719]">Architecture</Link></li>
                <li><Link href="#dashboard" className="hover:text-[#0E1719]">CLI Foundation</Link></li>
                <li><Link href="#chapters" className="hover:text-[#0E1719]">GitHub PR Gates</Link></li>
                <li><Link href="#dashboard" className="hover:text-[#0E1719]">Security &amp; Trust</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-3">
              <div className="font-sans font-bold text-[13px] text-[#0E1719] uppercase tracking-wider">
                Resources
              </div>
              <ul className="space-y-2 text-[#5B6668]">
                <li><Link href="#faq" className="hover:text-[#0E1719]">Documentation</Link></li>
                <li><Link href="#faq" className="hover:text-[#0E1719]">Playwright Guide</Link></li>
                <li><Link href="#faq" className="hover:text-[#0E1719]">API Reference</Link></li>
                <li><Link href="#faq" className="hover:text-[#0E1719]">Migrate from Cypress</Link></li>
                <li><Link href="#dashboard" className="hover:text-[#0E1719]">Status Page</Link></li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div className="space-y-3">
              <div className="font-sans font-bold text-[13px] text-[#0E1719] uppercase tracking-wider">
                Company
              </div>
              <ul className="space-y-2 text-[#5B6668]">
                <li><Link href="#results" className="hover:text-[#0E1719]">About Us</Link></li>
                <li><Link href="#results" className="hover:text-[#0E1719]">Customers</Link></li>
                <li><Link href="#results" className="hover:text-[#0E1719]">Careers</Link></li>
                <li><Link href="#hero" className="hover:text-[#0E1719]">Brand Identity</Link></li>
                <li><Link href="#pricing" className="hover:text-[#0E1719]">Contact Us</Link></li>
              </ul>
            </div>

            {/* Column 5: Legal & Compliance */}
            <div className="space-y-3">
              <div className="font-sans font-bold text-[13px] text-[#0E1719] uppercase tracking-wider">
                Compliance
              </div>
              <ul className="space-y-2 text-[#5B6668]">
                <li><Link href="#privacy" className="hover:text-[#0E1719]">Privacy Policy</Link></li>
                <li><Link href="#terms" className="hover:text-[#0E1719]">Terms of Service</Link></li>
                <li><Link href="#security" className="hover:text-[#0E1719]">Security Whitepaper</Link></li>
                <li><Link href="#soc2" className="hover:text-[#0E1719]">SOC 2 Certification</Link></li>
                <li><Link href="#cookies" className="hover:text-[#0E1719]">Cookie Preferences</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Icons & Copyright Row */}
          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[12px] text-[#5B6668]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0E9F6E]" />
              <span>GLOBAL CLOUD GRID: 99.98% OPERATIONAL</span>
            </div>
            <div>
              © 2026 OmniTest Systems, Inc. All rights reserved.
            </div>
          </div>

          {/* Giant Cropped OmniTest Wordmark */}
          <div className="pt-4 text-center select-none overflow-hidden leading-none">
            <span className="font-sans font-black text-[clamp(4.5rem,14vw,14rem)] tracking-tighter text-[#0E1719]/[0.06] block translate-y-4">
              OmniTest
            </span>
          </div>
        </Container>
      </footer>
    </div>
  );
};
