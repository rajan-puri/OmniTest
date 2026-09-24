import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090A0F",
        surface: {
          DEFAULT: "#12141A",
          50: "#181A22",
          100: "#14161D",
          200: "#0F1117",
          300: "#0B0C10",
          card: "#111319",
          "card-hover": "#161922",
          subtle: "#0E1015",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.05)",
          muted: "rgba(255, 255, 255, 0.10)",
          strong: "rgba(255, 255, 255, 0.16)",
          accent: "rgba(16, 185, 129, 0.4)",
        },
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        status: {
          passed: "#10b981",
          failed: "#f43f5e",
          running: "#f59e0b",
          queued: "#71717a",
          timed_out: "#f97316",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.35)",
        card: "0 2px 8px -2px rgba(0, 0, 0, 0.5)",
        dropdown: "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
