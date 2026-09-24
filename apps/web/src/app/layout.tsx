import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0E0D0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "OmniTest — One platform. Every test.",
  description:
    "The unified developer testing platform. Orchestrate browser UI workflows, API testing, accessibility scans, and Core Web Vitals in a single cloud grid with Playwright, axe-core, and Lighthouse.",
  keywords: [
    "OmniTest",
    "automated testing",
    "Playwright",
    "axe-core",
    "Lighthouse",
    "CI/CD testing",
    "visual regression",
    "API testing",
    "accessibility testing",
    "test orchestration",
  ],
  authors: [{ name: "OmniTest Engineering" }],
  creator: "OmniTest",
  publisher: "OmniTest",
  metadataBase: new URL("https://omnitest.dev"),
  openGraph: {
    title: "OmniTest — One platform. Every test.",
    description:
      "Orchestrate browser workflows, API assertions, accessibility audits, and Core Web Vitals in one unified platform.",
    url: "https://omnitest.dev",
    siteName: "OmniTest",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniTest — One platform. Every test.",
    description:
      "The unified developer testing platform. Eliminate testing tool sprawl.",
    creator: "@omnitest",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#FBFAF7] text-[#0E1719] antialiased selection:bg-[#0E9F6E]/20 selection:text-[#0E9F6E]">
        <div className="relative min-h-screen flex flex-col bg-[#FBFAF7]">
          {children}
        </div>
      </body>
    </html>
  );
}
