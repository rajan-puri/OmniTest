"use client";

import React, { useState, useEffect } from "react";
import { Container } from "../primitives/Container";

const CYCLE_WORDS = ["Recorder", "Workers", "Reports"];

export const ActionIntroSection: React.FC = () => {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIdx((prev) => (prev + 1) % CYCLE_WORDS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="action-intro"
      className="relative w-full py-[clamp(80px,11vw,144px)] bg-[#0F1B1D] text-white overflow-hidden border-b border-white/[0.08] select-none"
    >
      <Container className="relative z-10 text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-4 font-mono text-[12px] font-bold text-[#2BB5A6] uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-pulse" />
          <span>SEE A TEST RUN IN ACTION</span>
        </div>

        {/* Big centered word cycling Recorder -> Workers -> Reports */}
        <div className="h-[clamp(3.5rem,8vw,7rem)] flex items-center justify-center">
          <h2 className="text-[clamp(3rem,7.5vw,6.5rem)] font-extrabold tracking-[-0.03em] leading-none transition-all duration-500 text-white">
            <span className="text-[#FF5A1F]">{CYCLE_WORDS[currentWordIdx]}</span>
          </h2>
        </div>

        {/* Narrative Description */}
        <p className="mt-6 text-[17px] md:text-[19px] text-[#A2AEAF] max-w-xl mx-auto leading-relaxed">
          From human click capture to 32 headless cloud nodes, watch how every
          assertion moves through the execution lifecycle in milliseconds.
        </p>

        {/* Interactive Milestone Indicator */}
        <div className="mt-8 flex items-center gap-3 font-mono text-[12px]">
          {CYCLE_WORDS.map((w, idx) => (
            <div
              key={w}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] border transition-all ${
                currentWordIdx === idx
                  ? "border-[#FF5A1F] bg-[#FF5A1F]/10 text-white font-bold"
                  : "border-white/10 text-[#5B6668]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentWordIdx === idx ? "bg-[#FF5A1F] animate-pulse" : "bg-white/20"
                }`}
              />
              <span>{`0${idx + 1} ${w.toUpperCase()}`}</span>
            </div>
          ))}
        </div>
      </Container>

      {/* Perspective Grid Floor with Animated Orange Path Line */}
      <div className="relative w-full h-[220px] md:h-[280px] mt-8 overflow-hidden pointer-events-none">
        {/* 3D Perspective Plane */}
        <div
          className="absolute inset-0 origin-bottom"
          style={{
            transform: "perspective(300px) rotateX(45deg) scale(1.6)",
          }}
        >
          {/* Floor grid */}
          <div className="w-full h-full dark-grid" />
        </div>

        {/* Animated Orange Path Line Overlay */}
        <svg
          viewBox="0 0 1000 300"
          className="absolute inset-0 w-full h-full preserve-3d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Converging Orange Highway Path */}
          <path
            d="M 500 0 L 500 300"
            stroke="#FF5A1F"
            strokeWidth="3"
            strokeDasharray="8 6"
            className="animate-[dash_1.5s_linear_infinite]"
          />
          <path
            d="M 400 0 L 200 300"
            stroke="rgba(255, 90, 31, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <path
            d="M 600 0 L 800 300"
            stroke="rgba(255, 90, 31, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />

          {/* Glowing pulse rings at horizon */}
          <circle cx="500" cy="10" r="16" fill="rgba(255, 90, 31, 0.2)" />
          <circle cx="500" cy="10" r="6" fill="#FF5A1F" />
        </svg>

        {/* Bottom fade into next section */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0F1B1D] to-transparent" />
      </div>
    </section>
  );
};
