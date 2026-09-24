"use client";

import React, { useState, useEffect } from "react";
import { Container } from "../primitives/Container";
import { Button } from "../primitives/Button";

const INTEGRATIONS = [
  "Playwright",
  "GitHub Actions",
  "GitLab CI",
  "Jenkins",
  "Slack",
  "Jira",
  "Docker",
  "AWS CodePipeline",
  "CircleCI",
];

// Isometric test grid tiles definition
const ISO_TILES = [
  { id: 1, row: 0, col: 0, label: "E2E: Auth", pathIndex: 0 },
  { id: 2, row: 0, col: 1, label: "API: 200 OK", pathIndex: 1 },
  { id: 3, row: 0, col: 2, label: "Perf: 98", pathIndex: -1 },
  { id: 4, row: 1, col: 0, label: "A11y: 0 Err", pathIndex: -1 },
  { id: 5, row: 1, col: 1, label: "Visual Diff", pathIndex: 2 },
  { id: 6, row: 1, col: 2, label: "CWV: 0.8s", pathIndex: 3 },
  { id: 7, row: 2, col: 0, label: "SEO Check", pathIndex: -1 },
  { id: 8, row: 2, col: 1, label: "OWASP Pass", pathIndex: -1 },
  { id: 9, row: 2, col: 2, label: "Gate: PASS", pathIndex: 4 },
];

export const EditorialHero: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Sequential light-up of passed tiles
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.04;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.04;
    setParallax({ x, y });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full pt-16 pb-12 bg-gradient-to-b from-[#FBFAF7] via-[#F8F7F2] to-[#FBFAF7] border-b border-[#E4E6E3] overflow-hidden"
    >
      <Container className="pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline max 8 words */}
          <div className="lg:col-span-7 flex flex-col z-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-4 font-mono text-[12px] font-bold text-[#2BB5A6] tracking-wider uppercase select-none">
              <span className="w-2 h-2 rounded-full bg-[#0E9F6E]" />
              <span>UNIFIED QUALITY INFRASTRUCTURE</span>
            </div>

            {/* Headline max 8 words */}
            <h1 className="text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold tracking-[-0.03em] leading-[1.02] text-[#0E1719] mb-6">
              One unified run for every web test.
            </h1>

            {/* Short Paragraph */}
            <p className="text-[17px] md:text-[18px] text-[#5B6668] leading-relaxed max-w-xl mb-8 font-normal">
              Execute Playwright workflows, accessibility audits, visual diffs,
              and API contract assertions concurrently in one parallel cloud grid.
            </p>

            {/* Two Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Button href="/dashboard" variant="primary" size="lg">
                Start free trial
              </Button>
              <Button href="#action-intro" variant="outline" size="lg">
                Explore platform
              </Button>
            </div>

            {/* Metrics Telemetry Strip */}
            <div className="mt-12 pt-6 border-t border-[#E4E6E3] grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="font-mono text-[26px] md:text-[30px] font-bold text-[#0E1719] tabular-nums">
                  142/142
                </div>
                <div className="text-[12px] text-[#5B6668] uppercase tracking-wider font-medium mt-0.5">
                  Assertions Passed
                </div>
              </div>
              <div>
                <div className="font-mono text-[26px] md:text-[30px] font-bold text-[#0E9F6E] tabular-nums">
                  180ms
                </div>
                <div className="text-[12px] text-[#5B6668] uppercase tracking-wider font-medium mt-0.5">
                  Worker Cold Boot
                </div>
              </div>
              <div>
                <div className="font-mono text-[26px] md:text-[30px] font-bold text-[#FF5A1F] tabular-nums">
                  0 Flakes
                </div>
                <div className="text-[12px] text-[#5B6668] uppercase tracking-wider font-medium mt-0.5">
                  Zero False Flags
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Original SVG Isometric Test Grid Artwork */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center">
            <div
              className="relative w-full max-w-[460px] aspect-square transition-transform duration-300 ease-out"
              style={{
                transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
              }}
            >
              {/* SVG Isometric Canvas */}
              <svg
                viewBox="0 0 500 500"
                className="w-full h-full drop-shadow-md select-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Isometric projection: (x - y) * cos(30), (x + y) * sin(30) */}
                <g transform="translate(250, 100)">
                  {/* Isometric Tiles */}
                  {ISO_TILES.map((tile) => {
                    const originX = (tile.col - tile.row) * 75;
                    const originY = (tile.col + tile.row) * 44;
                    const isPathTile = tile.pathIndex >= 0;
                    const isPassed = isPathTile && activeStep >= tile.pathIndex;
                    const isRunning = isPathTile && activeStep === tile.pathIndex;

                    return (
                      <g
                        key={tile.id}
                        transform={`translate(${originX}, ${originY})`}
                        className="transition-all duration-500 cursor-default"
                      >
                        {/* 3D Isometric Base Extrusion */}
                        <path
                          d="M 0 35 L 65 72.5 L 65 86 L 0 48.5 Z"
                          fill={isPassed ? "#0B855C" : isRunning ? "#D94814" : "#D5D8D3"}
                        />
                        <path
                          d="M 0 35 L -65 72.5 L -65 86 L 0 48.5 Z"
                          fill={isPassed ? "#096D4B" : isRunning ? "#B83A0E" : "#C4C8C1"}
                        />

                        {/* Top Isometric Diamond Face */}
                        <polygon
                          points="0,0 65,37.5 0,75 -65,37.5"
                          fill={
                            isPassed
                              ? "#0E9F6E"
                              : isRunning
                              ? "#FF5A1F"
                              : "#FFFFFF"
                          }
                          stroke={
                            isPassed
                              ? "#0E9F6E"
                              : isRunning
                              ? "#FF5A1F"
                              : "#E4E6E3"
                          }
                          strokeWidth="1.5"
                        />

                        {/* Status Icon & Label inside Diamond */}
                        {isPassed ? (
                          <g transform="translate(-16, 26)">
                            <circle cx="16" cy="12" r="10" fill="#0B855C" />
                            <path
                              d="M 12 12 L 15 15 L 21 9"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        ) : isRunning ? (
                          <g transform="translate(-16, 26)">
                            <circle cx="16" cy="12" r="8" fill="#FFFFFF" fillOpacity="0.3" className="animate-pulse" />
                            <circle cx="16" cy="12" r="4" fill="#FFFFFF" />
                          </g>
                        ) : (
                          <g transform="translate(0, 38)">
                            <text
                              x="0"
                              y="0"
                              fill="#5B6668"
                              fontSize="11"
                              fontFamily="var(--font-jetbrains-mono)"
                              fontWeight="600"
                              textAnchor="middle"
                            >
                              {tile.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Live Overlay Badge */}
              <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm border border-[#E4E6E3] px-3 py-1.5 rounded-[4px] font-mono text-[11px] text-[#0E1719] shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0E9F6E] animate-pulse" />
                <span>GRID: CLUSTER 04 PASSED</span>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Infinite Marquee of Integrations (Monochrome Chips) */}
      <div className="w-full border-t border-[#E4E6E3] bg-[#F8F7F2] py-4 overflow-hidden select-none">
        <div className="flex items-center gap-6 whitespace-nowrap animate-[marquee_24s_linear_infinite]">
          {[...INTEGRATIONS, ...INTEGRATIONS, ...INTEGRATIONS].map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-[4px] border border-[#E4E6E3] bg-white font-sans text-[13px] text-[#5B6668] shadow-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B6668]" />
              <span className="font-medium text-[#0E1719]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
