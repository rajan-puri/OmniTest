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
        paper: "#FBFAF7",
        ink: "#0E1719",
        muted: "#5B6668",
        border: {
          DEFAULT: "#E4E6E3",
          dark: "rgba(255, 255, 255, 0.1)",
        },
        dark: {
          DEFAULT: "#0F1B1D",
          surface: "#16262A",
          subtle: "#122023",
        },
        brand: {
          DEFAULT: "#0E9F6E",
          hover: "#0B855C",
          subtle: "#EAF6F1",
        },
        eyebrow: "#2BB5A6",
        path: "#FF5A1F",
        fail: "#E5484D",
        palemint: "#EAF6F1",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        none: "0",
        btn: "4px",
        card: "8px",
        sm: "4px",
        DEFAULT: "4px",
        md: "4px",
        lg: "8px",
        xl: "8px",
        "2xl": "8px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
