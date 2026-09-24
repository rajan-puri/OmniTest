"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./primitives/Button";

export const EditorialNav: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="sticky top-0 left-0 right-0 z-40 bg-[#FBFAF7]/95 backdrop-blur-md border-b border-[#E4E6E3] transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#EAF6F1] border-b border-[#0E9F6E]/15 px-4 py-1.5 text-center font-sans text-[12px] md:text-[13px] text-[#0E1719] flex items-center justify-center gap-2">
        <span className="font-semibold text-[#0E9F6E] uppercase tracking-wider text-[11px] px-1.5 py-0.5 rounded-[3px] bg-[#0E9F6E]/10">
          New
        </span>
        <span>OmniTest 2.4 is live with sub-180ms cloud worker allocation.</span>
        <Link
          href="#how-it-works"
          className="text-[#0E9F6E] font-semibold hover:underline inline-flex items-center gap-0.5 ml-1"
        >
          See architecture →
        </Link>
      </div>

      {/* Main Navbar */}
      <nav className="max-w-[1240px] mx-auto px-[clamp(20px,5vw,56px)] h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-[4px] bg-[#0E9F6E] flex items-center justify-center font-mono font-bold text-white text-[14px] shadow-sm">
            Ω
          </div>
          <span className="font-sans font-bold text-[19px] tracking-tight text-[#0E1719]">
            OmniTest
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#5B6668]">
          <Link href="#action-intro" className="hover:text-[#0E1719] transition-colors">
            Platform
          </Link>
          <Link href="#chapters" className="hover:text-[#0E1719] transition-colors">
            Solutions
          </Link>
          <Link href="#features" className="hover:text-[#0E1719] transition-colors">
            Docs
          </Link>
          <Link href="#pricing" className="hover:text-[#0E1719] transition-colors">
            Pricing
          </Link>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            href="#pricing"
            variant="outline"
            size="sm"
            className="text-[13px]"
          >
            Book a demo
          </Button>
          <Button
            href="/dashboard"
            variant="primary"
            size="sm"
            className="text-[13px]"
          >
            Start free
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-[#0E1719] focus:outline-none"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
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
      </nav>

      {/* Mobile Full-Screen Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[105px] z-50 bg-[#FBFAF7] p-6 flex flex-col justify-between overflow-y-auto">
          <div className="flex flex-col gap-4 font-sans text-[18px] font-semibold text-[#0E1719]">
            <Link
              href="#action-intro"
              onClick={() => setMobileOpen(false)}
              className="min-h-[44px] flex items-center border-b border-[#E4E6E3]"
            >
              Platform
            </Link>
            <Link
              href="#chapters"
              onClick={() => setMobileOpen(false)}
              className="min-h-[44px] flex items-center border-b border-[#E4E6E3]"
            >
              Solutions
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="min-h-[44px] flex items-center border-b border-[#E4E6E3]"
            >
              Docs
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="min-h-[44px] flex items-center border-b border-[#E4E6E3]"
            >
              Pricing
            </Link>
          </div>

          <div className="pt-6 flex flex-col gap-3">
            <Button
              href="#pricing"
              variant="outline"
              size="md"
              className="w-full text-center"
              onClick={() => setMobileOpen(false)}
            >
              Book a demo
            </Button>
            <Button
              href="/dashboard"
              variant="primary"
              size="md"
              className="w-full text-center"
              onClick={() => setMobileOpen(false)}
            >
              Start free
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
