import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { ToastProvider } from "@/components/providers/ToastProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Recon — What to Watch Tonight, Across Every Streaming Service",
  description:
    "Curated, high-rated movies from Netflix, Prime Video, Max, Apple TV+ and more — rated highly on IMDb and delivered free to your inbox every Friday. We tell you exactly where to watch each one.",
  keywords: [
    "movie recommendations",
    "what to watch tonight",
    "streaming recommendations",
    "weekly newsletter",
    "IMDb rated movies",
    "where to watch",
    "curated movies",
    "movie newsletter",
  ],
  openGraph: {
    title: "Recon — What to Watch Tonight, Across Every Streaming Service",
    description:
      "Curated, high-rated movies from across every streaming service, delivered free to your inbox every Friday.",
    type: "website",
    siteName: "Recon",
  },
};

// viewport-fit=cover lets pb-safe/pt-safe read the iPhone notch and home-bar
// insets; themeColor tints the mobile browser chrome to match the canvas.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080b17",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">
        <AdSenseScript />
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
