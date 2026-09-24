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
        background: "#08090C",
        surface: {
          50: "#181A20",
          100: "#13151A",
          200: "#0E1014",
          300: "#0A0B0E",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.07)",
          muted: "rgba(255, 255, 255, 0.12)",
          accent: "rgba(16, 185, 129, 0.3)",
        },
        brand: {
          50: "#ecfdf5",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "radial-glow": "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, rgba(8, 9, 12, 0) 70%)",
        "radial-glow-cyan": "radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.12) 0%, rgba(8, 9, 12, 0) 60%)",
        "radial-glow-violet": "radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, rgba(8, 9, 12, 0) 60%)",
        "grid-pattern": "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    },
  },
  plugins: [],
};
export default config;
