"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Terminal, Menu, X, ArrowUpRight } from "lucide-react";

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-[34px] xl:top-0 z-40 w-full border-b border-white/[0.08] bg-[#0E0D0B]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Grid Status Indicator */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 group focus:outline-none"
              aria-label="OmniTest Homepage"
            >
              <div className="w-6 h-6 rounded bg-[#1C1A16] border border-white/[0.12] flex items-center justify-center text-[#00F090]">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold tracking-tight text-[#ECEAE5]">
                OmniTest
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#151411] border border-white/[0.06] text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F090] animate-pulse" />
              <span>GRID: 4 WORKERS READY</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs text-zinc-400 font-mono">
            <a href="#pipeline" className="hover:text-white transition-colors">
              02.Pipeline
            </a>
            <a href="#visual-diff" className="hover:text-white transition-colors">
              03.VisualDiff
            </a>
            <a href="#quality-fleet" className="hover:text-white transition-colors">
              04.Fleet
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              05.CI/CD
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              06.Pricing
            </a>
          </nav>

          {/* CTA Actions */}
          <div className="hidden sm:flex items-center gap-3 font-mono text-xs">
            <Link
              href="/login"
              className="text-zinc-400 hover:text-white transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1.5 rounded bg-[#00E58F] hover:bg-[#00d680] text-[#0E0D0B] font-semibold flex items-center gap-1 transition-colors"
            >
              Start Free
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded text-zinc-400 hover:text-white bg-[#151411] border border-white/[0.08]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#12110E] px-4 py-4 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2 text-zinc-300">
            <a
              href="#pipeline"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded bg-white/[0.03] border border-white/[0.06]"
            >
              02. Pipeline
            </a>
            <a
              href="#visual-diff"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded bg-white/[0.03] border border-white/[0.06]"
            >
              03. Visual Diff
            </a>
            <a
              href="#quality-fleet"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded bg-white/[0.03] border border-white/[0.06]"
            >
              04. Fleet
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded bg-white/[0.03] border border-white/[0.06]"
            >
              05. CI/CD
            </a>
          </div>
          <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
            <Link
              href="/login"
              className="flex-1 text-center py-2 rounded bg-white/[0.05] text-zinc-300"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center py-2 rounded bg-[#00F090] text-[#0E0D0B] font-semibold"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
