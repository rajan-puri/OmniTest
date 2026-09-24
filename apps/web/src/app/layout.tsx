import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#08090C",
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
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-background text-zinc-100 antialiased selection:bg-brand-500/20 selection:text-brand-400">
        <div className="relative min-h-screen flex flex-col bg-radial-glow">
          {children}
        </div>
      </body>
    </html>
  );
}
