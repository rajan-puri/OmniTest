"use client";

import React, { useEffect, useState, useRef } from "react";

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 1.6,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}) => {
  const [value, setValue] = useState(start);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const startTime = performance.now();
            const totalDuration = duration * 1000;

            const step = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / totalDuration, 1);
              // easeOutExpo
              const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const current = start + (end - start) * eased;
              setValue(current);

              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                setValue(end);
              }
            };

            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, start, duration]);

  const formattedValue = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      ref={elementRef}
      className={`font-mono tabular-nums ${className}`}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};
