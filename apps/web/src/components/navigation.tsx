"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Terminal, Menu, X, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Capabilities", href: "#capabilities" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Visual Testing", href: "#visual-testing" },
    { name: "Workflow", href: "#workflow" },
    { name: "Dashboard", href: "#dashboard" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-[#08090C]/85 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/40"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg p-1"
            aria-label="OmniTest Homepage"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
              <Terminal className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              OmniTest
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-400 border border-white/[0.06]">
                v0.1
              </span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-400" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 rounded-md hover:text-white hover:bg-white/[0.04] transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5 transition-colors focus:outline-none"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 transition-colors flex items-center gap-1.5 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              Start Testing Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel-elevated border-b border-white/[0.1] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05]"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 text-sm font-medium text-zinc-300 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2"
            >
              Start Testing Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
