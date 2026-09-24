import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "canvas" | "surface" | "surface-2" | "light" | "mint";
  blueprint?: boolean;
  padding?: "normal" | "compact" | "hero" | "none";
  borderTop?: boolean;
  borderBottom?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  id,
  children,
  className = "",
  variant = "canvas",
  blueprint = false,
  padding = "normal",
  borderTop = false,
  borderBottom = false,
  ...props
}) => {
  const variantStyles = {
    canvas: "bg-[#0E0D0B] text-[#F5F3EE]",
    surface: "bg-[#161512] text-[#F5F3EE]",
    "surface-2": "bg-[#1D1B17] text-[#F5F3EE]",
    light: "theme-light-stage bg-[#F1EFE8] text-[#14130F]",
    mint: "bg-[#00E58F] text-[#0E0D0B]",
  }[variant];

  const paddingStyles = {
    normal: "py-[clamp(96px,14vw,176px)]",
    compact: "py-[clamp(64px,8vw,96px)]",
    hero: "min-h-screen pt-[clamp(96px,12vw,140px)] pb-[clamp(64px,8vw,112px)] flex flex-col justify-between",
    none: "",
  }[padding];

  const blueprintClass = blueprint
    ? variant === "light"
      ? "blueprint-grid-light"
      : "blueprint-grid"
    : "";

  const borderTopClass = borderTop
    ? variant === "light"
      ? "border-t border-[#14130F]/12"
      : variant === "mint"
      ? "border-t border-[#0E0D0B]/16"
      : "border-t border-white/[0.08]"
    : "";

  const borderBottomClass = borderBottom
    ? variant === "light"
      ? "border-b border-[#14130F]/12"
      : variant === "mint"
      ? "border-b border-[#0E0D0B]/16"
      : "border-b border-white/[0.08]"
    : "";

  return (
    <section
      id={id}
      className={`relative w-full overflow-hidden ${variantStyles} ${paddingStyles} ${blueprintClass} ${borderTopClass} ${borderBottomClass} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
};
