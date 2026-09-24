"use client";

import React from "react";
import { SeoTestSpec, SeoCheckCategories, SeoAssertions } from "@/lib/runner/seo-types";
import { Globe, ShieldCheck, CheckSquare, Search, AlertCircle } from "lucide-react";

interface SeoTestConfigProps {
  spec: SeoTestSpec;
  onChange: (updated: SeoTestSpec) => void;
  disabled?: boolean;
}

export function SeoTestConfig({ spec, onChange, disabled }: SeoTestConfigProps) {
  const checks: SeoCheckCategories = spec.checks || {
    technical: true,
    metadata: true,
    indexability: true,
    headings: true,
    images: true,
    links: true,
    social: true,
    structuredData: true,
    robotsTxt: true,
    sitemap: true,
    mobile: true,
  };

  const assertions: SeoAssertions = spec.assertions || {
    titleRequired: true,
    metaDescriptionRequired: true,
    canonicalRequired: true,
    h1Required: true,
    noindexDisallowed: false,
    expectedStatusCode: 200,
    structuredDataRequired: false,
    noBrokenLinks: false,
  };

  const updateField = (field: keyof SeoTestSpec, value: any) => {
    onChange({
      ...spec,
      [field]: value,
    });
  };

  const updateCheck = (key: keyof SeoCheckCategories, value: boolean) => {
    onChange({
      ...spec,
      checks: {
        ...checks,
        [key]: value,
      },
    });
  };

  const updateAssertion = (key: keyof SeoAssertions, value: any) => {
    onChange({
      ...spec,
      assertions: {
        ...assertions,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Target URL */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Target URL to Audit
        </label>
        <p className="text-xs text-slate-400 mb-3">
          OmniTest will launch a headless Chromium browser instance to inspect document metadata, DOM semantics, HTTP response headers, and linked assets.
        </p>
        <div className="relative">
          <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={spec.url}
            onChange={(e) => updateField("url", e.target.value)}
            placeholder="https://example.com/page or /products"
            disabled={disabled}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-10 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* 2. Audit Categories */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">SEO Inspection Checks</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Select the technical categories to analyze during the audit:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: "technical", label: "Technical SEO", desc: "HTTP status, redirects, canonical, lang" },
            { id: "metadata", label: "Metadata & Titles", desc: "Title tag & meta description length" },
            { id: "indexability", label: "Indexability Signals", desc: "Robots directives & X-Robots-Tag" },
            { id: "headings", label: "Heading Hierarchy", desc: "H1 count & hierarchy ordering" },
            { id: "images", label: "Image Semantics", desc: "Alt text & decorative vs content" },
            { id: "links", label: "Link Inspection", desc: "Direct links, empty text, broken check" },
            { id: "social", label: "Social Metadata", desc: "Open Graph & Twitter card tags" },
            { id: "structuredData", label: "Structured Data", desc: "JSON-LD syntax, schema types, microdata" },
            { id: "robotsTxt", label: "Robots.txt Analysis", desc: "Host /robots.txt crawl accessibility" },
            { id: "sitemap", label: "Sitemap Verification", desc: "Discovered sitemap XML structure" },
            { id: "mobile", label: "Mobile Readiness", desc: "Viewport meta tag & layout overflow" },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-md cursor-pointer hover:border-slate-700 transition-colors"
            >
              <input
                type="checkbox"
                checked={checks[item.id as keyof SeoCheckCategories] !== false}
                onChange={(e) => updateCheck(item.id as keyof SeoCheckCategories, e.target.checked)}
                disabled={disabled}
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
              <div>
                <span className="text-xs font-medium text-slate-200 block">{item.label}</span>
                <span className="text-[11px] text-slate-400">{item.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Deterministic Assertions */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckSquare className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Deterministic Assertions (Pass / Fail Criteria)</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Configure explicit requirements that must pass for this test run to succeed. Recommendations and non-critical heuristics will generate warnings without failing the test:
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={assertions.titleRequired !== false}
                onChange={(e) => updateAssertion("titleRequired", e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-200 font-medium">Page &lt;title&gt; is required</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={assertions.metaDescriptionRequired !== false}
                onChange={(e) => updateAssertion("metaDescriptionRequired", e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-200 font-medium">Meta description is required</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={assertions.canonicalRequired !== false}
                onChange={(e) => updateAssertion("canonicalRequired", e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-200 font-medium">Canonical URL tag is required</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={assertions.h1Required !== false}
                onChange={(e) => updateAssertion("h1Required", e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-200 font-medium">At least one &lt;h1&gt; heading required</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={assertions.noindexDisallowed === true}
                onChange={(e) => updateAssertion("noindexDisallowed", e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-200 font-medium">Fail if &apos;noindex&apos; directive is detected</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={assertions.structuredDataRequired === true}
                onChange={(e) => updateAssertion("structuredDataRequired", e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-200 font-medium">Structured data (JSON-LD) is required</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-slate-800/80 rounded-md cursor-pointer">
              <input
                type="checkbox"
                checked={assertions.noBrokenLinks === true}
                onChange={(e) => updateAssertion("noBrokenLinks", e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-200 font-medium">Fail if broken links are detected</span>
            </label>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="text-xs text-slate-300 font-medium">
              Expected HTTP Status Code:
            </label>
            <input
              type="number"
              value={assertions.expectedStatusCode ?? 200}
              onChange={(e) => updateAssertion("expectedStatusCode", parseInt(e.target.value, 10) || 200)}
              disabled={disabled}
              className="w-24 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Technical Audit Notice */}
      <div className="flex items-start gap-2.5 p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300 text-xs">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Automated Technical Audit Notice:</span>
          OmniTest evaluates deterministic technical web standards and crawlability signals. It does not generate arbitrary SEO scores, guarantee search engine ranking results, or replace comprehensive organic keyword analytics.
        </div>
      </div>
    </div>
  );
}
