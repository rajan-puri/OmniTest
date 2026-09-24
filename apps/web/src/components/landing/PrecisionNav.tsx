"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./primitives/Button";

export const PrecisionNav: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-[28px] xl:top-0 left-0 right-0 z-40 bg-[#0E0D0B]/90 backdrop-blur-md border-b border-white/[0.08] transition-all">
      <div className="max-w-[1280px] mx-auto px-[clamp(20px,5vw,64px)] h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-[6px] bg-[#161512] border border-white/[0.12] flex items-center justify-center font-mono font-bold text-[#00E58F] text-[15px] group-hover:border-[#00E58F]/50 transition-colors">
            Ω
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-[17px] tracking-tight text-[#F5F3EE]">
              OmniTest
            </span>
            <span className="font-mono text-[9px] text-[#6B675E] tracking-widest uppercase -mt-0.5">
              PRECISION RUNNER
            </span>
          </div>
        </Link>

        {/* Center telemetry */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-[4px] border border-white/[0.08] bg-[#161512] font-mono text-[12px] tabular-nums text-[#A29E94]">
          <span className="w-2 h-2 rounded-full bg-[#00E58F] animate-pulse" />
          <span>GRID: 4 WORKERS ONLINE</span>
          <span className="text-white/20">|</span>
          <span className="text-[#6B675E]">LATENCY: 12ms</span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#problem"
            className="text-[14px] text-[#A29E94] hover:text-[#F5F3EE] transition-colors"
          >
            Why OmniTest
          </a>
          <a
            href="#how-it-works"
            className="text-[14px] text-[#A29E94] hover:text-[#F5F3EE] transition-colors"
          >
            Architecture
          </a>
          <a
            href="#visual-regression"
            className="text-[14px] text-[#A29E94] hover:text-[#F5F3EE] transition-colors"
          >
            Visual Diff
          </a>
          <a
            href="#capabilities"
            className="text-[14px] text-[#A29E94] hover:text-[#F5F3EE] transition-colors"
          >
            Capabilities
          </a>
          <a
            href="#pricing"
            className="text-[14px] text-[#A29E94] hover:text-[#F5F3EE] transition-colors"
          >
            Pricing
          </a>
        </nav>

        {/* CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            href="/dashboard"
            variant="outline"
            size="sm"
            className="text-[13px] font-mono"
          >
            Console
          </Button>
          <Button
            href="/dashboard"
            variant="primary"
            size="sm"
            className="text-[13px] font-mono font-semibold"
          >
            Start Free
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-[#F5F3EE] hover:text-[#00E58F] focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0E0D0B] px-6 py-6 flex flex-col gap-4 font-mono text-[14px]">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08] text-[12px] text-[#A29E94]">
            <span className="w-2 h-2 rounded-full bg-[#00E58F]" />
            <span>GRID: 4 WORKERS ONLINE</span>
          </div>
          <a
            href="#problem"
            onClick={() => setMobileOpen(false)}
            className="min-h-[44px] flex items-center text-[#A29E94] hover:text-[#F5F3EE]"
          >
            Why OmniTest
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="min-h-[44px] flex items-center text-[#A29E94] hover:text-[#F5F3EE]"
          >
            Architecture
          </a>
          <a
            href="#visual-regression"
            onClick={() => setMobileOpen(false)}
            className="min-h-[44px] flex items-center text-[#A29E94] hover:text-[#F5F3EE]"
          >
            Visual Diff
          </a>
          <a
            href="#capabilities"
            onClick={() => setMobileOpen(false)}
            className="min-h-[44px] flex items-center text-[#A29E94] hover:text-[#F5F3EE]"
          >
            Capabilities
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="min-h-[44px] flex items-center text-[#A29E94] hover:text-[#F5F3EE]"
          >
            Pricing
          </a>
          <div className="pt-2 flex flex-col gap-3">
            <Button
              href="/dashboard"
              variant="outline"
              size="md"
              className="w-full text-center"
              onClick={() => setMobileOpen(false)}
            >
              Console
            </Button>
            <Button
              href="/dashboard"
              variant="primary"
              size="md"
              className="w-full text-center"
              onClick={() => setMobileOpen(false)}
            >
              Start Free
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
