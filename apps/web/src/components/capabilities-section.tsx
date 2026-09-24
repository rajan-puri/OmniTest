import React from "react";
import {
  Monitor,
  Workflow,
  FileCheck2,
  ShieldAlert,
  Eye,
  Gauge,
  Search,
  Lock,
  ArrowUpRight,
} from "lucide-react";

export function CapabilitiesSection() {
  const capabilities = [
    {
      icon: Monitor,
      title: "UI & Browser Testing",
      badge: "Playwright Core",
      color: "from-brand-500/20 to-brand-500/0 text-brand-400 border-brand-500/30",
      description:
        "Execute cross-browser tests on real headless Chromium, Firefox, and WebKit. Emulate mobile devices, touch events, and geolocations with automatic retries.",
      details: ["Cross-browser parity", "Automatic locator retry", "Video & Playwright trace"],
    },
    {
      icon: Workflow,
      title: "Functional Workflows",
      badge: "Session State",
      color: "from-cyan-500/20 to-cyan-500/0 text-cyan-400 border-cyan-500/30",
      description:
        "Test complete end-to-end customer journeys. Share authenticated storage states across test suites to skip redundant login forms and speed up CI.",
      details: ["Stateful session reuse", "Parameterized data fixtures", "Multi-tab orchestration"],
    },
    {
      icon: FileCheck2,
      title: "API & Contract Testing",
      badge: "HTTP / REST",
      color: "from-blue-500/20 to-blue-500/0 text-blue-400 border-blue-500/30",
      description:
        "Assert HTTP status codes, latency SLAs, headers, and payload schemas via Zod. Chain tokens and IDs from upstream API calls into downstream requests.",
      details: ["JSON schema validation", "Response latency SLAs", "Dynamic variable chaining"],
    },
    {
      icon: ShieldAlert,
      title: "Accessibility (a11y)",
      badge: "axe-core",
      color: "from-violet-500/20 to-violet-500/0 text-violet-400 border-violet-500/30",
      description:
        "Audit every page against WCAG 2.1 Level A & AA standards automatically. Catch color contrast, missing ARIA tags, and keyboard traps before users notice.",
      details: ["WCAG 2.1 Level A & AA", "Selector path mapping", "Actionable remediation tips"],
    },
    {
      icon: Eye,
      title: "Visual Regression",
      badge: "Pixel Diffing",
      color: "from-fuchsia-500/20 to-fuchsia-500/0 text-fuchsia-400 border-fuchsia-500/30",
      description:
        "Pixel-level screenshot comparison with anti-aliasing tolerance. Flag visual drifts, layout breakage, and unintended CSS modifications across viewports.",
      details: ["Anti-aliased diff masks", "Dynamic element masking", "Baseline approval workflow"],
    },
    {
      icon: Gauge,
      title: "Core Web Vitals",
      badge: "Lighthouse",
      color: "from-amber-500/20 to-amber-500/0 text-amber-400 border-amber-500/30",
      description:
        "Measure LCP, CLS, and INP on realistic throttled mobile 4G networks. Set strict performance budgets that fail pull requests if regressions occur.",
      details: ["Simulated 4G throttling", "LCP / CLS / INP metrics", "Performance budget gates"],
    },
    {
      icon: Search,
      title: "SEO & Metadata Audit",
      badge: "Crawler Engine",
      color: "from-emerald-500/20 to-emerald-500/0 text-emerald-400 border-emerald-500/30",
      description:
        "Verify title tags, meta descriptions, OpenGraph social previews, canonical URLs, and heading hierarchy across pre-release deployments.",
      details: ["OpenGraph tag validation", "Broken link crawling", "Heading order verification"],
    },
    {
      icon: Lock,
      title: "Security Hygiene",
      badge: "DAST & Headers",
      color: "from-rose-500/20 to-rose-500/0 text-rose-400 border-rose-500/30",
      description:
        "Validate Content Security Policies (CSP), HSTS, secure cookie attributes, SSL certificate validity, and common injection attack surfaces.",
      details: ["CSP & HSTS inspection", "Cookie hygiene checks", "SSL/TLS expiration alerts"],
    },
  ];

  return (
    <section id="capabilities" className="py-24 relative bg-[#08090C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-wider text-brand-400 uppercase bg-brand-950/40 px-3 py-1 rounded-full border border-brand-500/20">
            Unified Testing Capabilities
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Every test your application needs. <br />
            None of the tool fragmentation.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Why maintain 5 disparate test harnesses when OmniTest orchestrates all quality dimensions in one unified runner?
          </p>
        </div>

        {/* Capabilities 8-card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="p-6 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all duration-200 flex flex-col justify-between group bg-gradient-to-b from-white/[0.02] to-transparent"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-brand-400" />
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                      {cap.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{cap.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {cap.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] space-y-1.5">
                  {cap.details.map((detail) => (
                    <div key={detail} className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400/60" />
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
