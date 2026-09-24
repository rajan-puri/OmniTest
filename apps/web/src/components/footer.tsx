import React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#06070A] text-zinc-400 text-xs py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-zinc-950 font-bold">
                <Terminal className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>OmniTest</span>
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              The unified quality engineering and test orchestration platform for modern software teams.
              One platform. Every test.
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (99.98% uptime)</span>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="font-semibold text-white mb-3 font-mono text-xs uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  UI &amp; Browser Testing
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  API Assertions
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-white transition-colors">
                  Accessibility (axe)
                </a>
              </li>
              <li>
                <a href="#visual-testing" className="hover:text-white transition-colors">
                  Visual Regression
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-white transition-colors">
                  Developer CLI
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Open Source Engines */}
          <div>
            <h4 className="font-semibold text-white mb-3 font-mono text-xs uppercase tracking-wider">
              Engines
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-zinc-300">Playwright</span>
              </li>
              <li>
                <span className="text-zinc-300">axe-core</span>
              </li>
              <li>
                <span className="text-zinc-300">Google Lighthouse</span>
              </li>
              <li>
                <span className="text-zinc-300">Pixelmatch</span>
              </li>
              <li>
                <span className="text-zinc-300">BullMQ &amp; Redis</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Specs */}
          <div>
            <h4 className="font-semibold text-white mb-3 font-mono text-xs uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <span className="text-zinc-500">Security Architecture</span>
              </li>
              <li>
                <span className="text-zinc-500">REST API Spec</span>
              </li>
              <li>
                <span className="text-zinc-500">Status Page</span>
              </li>
              <li>
                <span className="text-zinc-500">Privacy &amp; Terms</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-xs">
          <p>© {new Date().getFullYear()} OmniTest, Inc. All rights reserved.</p>
          <p className="font-mono text-[11px]">Positioning: One platform. Every test.</p>
        </div>
      </div>
    </footer>
  );
}
