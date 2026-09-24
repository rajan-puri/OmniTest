"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "dark" | "ghost";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  href,
  variant = "primary",
  size = "md",
  magnetic = true,
  icon,
  iconRight,
  children,
  className = "",
  external = false,
  onClick,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouch || reducedMotion || !magnetic || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * 0.22;
    const dy = (e.clientY - centerY) * 0.22;
    setOffset({ x: dx, y: dy });
  };

  const handleMouseLeave = () => {
    if (isTouch || reducedMotion || !magnetic) return;
    setOffset({ x: 0, y: 0 });
  };

  const variantStyles = {
    primary:
      "bg-[#00E58F] text-[#0E0D0B] font-semibold hover:bg-[#05F096] border border-[#00E58F] shadow-none",
    secondary:
      "bg-[#161512] text-[#F5F3EE] hover:bg-[#1D1B17] border border-white/[0.12] hover:border-white/[0.22]",
    outline:
      "bg-transparent text-[#F5F3EE] hover:bg-white/[0.04] border border-white/[0.16] hover:border-white/[0.32]",
    dark:
      "bg-[#0E0D0B] text-[#F5F3EE] hover:bg-[#161512] border border-white/[0.16] hover:border-white/[0.28]",
    ghost:
      "bg-transparent text-[#A29E94] hover:text-[#F5F3EE] hover:bg-white/[0.04] border border-transparent",
  }[variant];

  const sizeStyles = {
    sm: "h-[38px] min-h-[38px] px-3.5 text-[13px] gap-2",
    md: "h-[46px] min-h-[44px] px-5 text-[14px] gap-2.5",
    lg: "h-[54px] min-h-[48px] px-7 text-[16px] gap-3 font-medium",
  }[size];

  const baseStyles =
    "inline-flex items-center justify-center rounded-[6px] tracking-tight transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E58F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0D0B] active:scale-[0.98]";

  const transformStyle =
    magnetic && !isTouch && !reducedMotion
      ? {
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: offset.x === 0 ? "transform 0.3s ease-out" : "transform 0.08s ease-out",
        }
      : undefined;

  const content = (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="font-sans leading-none">{children}</span>
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          ref={btnRef as React.RefObject<HTMLAnchorElement>}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
          style={transformStyle}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        ref={btnRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        style={transformStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick as any}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={btnRef as React.RefObject<HTMLButtonElement>}
      type={(props.type as any) || "button"}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      style={transformStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
};
