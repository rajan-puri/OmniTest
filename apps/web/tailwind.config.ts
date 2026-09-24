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
        canvas: "#0E0D0B",
        surface: {
          DEFAULT: "#161512",
          2: "#1D1B17",
          subtle: "#12110E",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.05)",
          strong: "rgba(255, 255, 255, 0.16)",
        },
        mint: {
          DEFAULT: "#00E58F",
          dark: "#00B370",
          subtle: "rgba(0, 229, 143, 0.12)",
        },
        fail: "#F43F5E",
        warn: "#F59E0B",
        info: "#38BDF8",
        content: {
          primary: "#F5F3EE",
          secondary: "#A29E94",
          tertiary: "#6B675E",
        },
        stage: {
          bg: "#F1EFE8",
          text: "#14130F",
          border: "rgba(20, 19, 15, 0.1)",
        },
      },
      fontFamily: {
        sans: ["var(--font-bricolage)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        none: "0",
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "6px",
        xl: "6px",
        "2xl": "6px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
