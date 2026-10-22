import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DevicePreviewRoot } from "@/components/device-preview/DevicePreviewRoot";

/**
 * AGENT RULES:
 * - Do NOT add "use client" to this file — it breaks streaming and metadata.
 * - Font is Inter — do not import other fonts here without also updating globals.css.
 * - Update the metadata defaults below for each new project.
 */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // ── Edit these per project ──────────────────────────────────────────────
  title: {
    default: "Your Site Name",
    template: "%s | Your Site Name",
  },
  description: "Your site description — edit this in app/layout.tsx",
  // ── Keep these ─────────────────────────────────────────────────────────
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <DevicePreviewRoot>{children}</DevicePreviewRoot>
      </body>
    </html>
  );
}
