import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Recon — Weekly High-Rated Netflix Movie Recommendations",
  description:
    "Discover curated Netflix movies rated highly on IMDb, delivered free to your inbox every Friday. No spam, no algorithms — just great films.",
  keywords: [
    "Netflix recommendations",
    "movie recommendations",
    "weekly newsletter",
    "IMDb rated movies",
    "Netflix movies",
    "curated movies",
    "movie newsletter",
  ],
  openGraph: {
    title: "Recon — Weekly High-Rated Netflix Movie Recommendations",
    description:
      "Discover curated Netflix movies rated highly on IMDb, delivered free to your inbox every Friday.",
    type: "website",
    siteName: "Recon",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
