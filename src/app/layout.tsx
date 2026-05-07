import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reddit Insights Engine - Content Strategy Intelligence",
  description: "AI-powered Reddit analysis for content strategy. Extract pain points, questions, and audience insights from marketing and entrepreneurship communities.",
  keywords: ["Reddit", "Content Strategy", "Marketing", "Entrepreneurship", "AI Analysis", "Lead Generation", "Audience Insights"],
  authors: [{ name: "Reddit Insights Engine" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Reddit Insights Engine",
    description: "AI-powered Reddit analysis for content strategy intelligence",
    url: "https://reddit-insights.ai",
    siteName: "Reddit Insights Engine",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reddit Insights Engine",
    description: "AI-powered Reddit analysis for content strategy intelligence",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
