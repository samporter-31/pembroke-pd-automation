import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Professional Learning Reports - Pembroke",
  description: "Transform your professional development sessions into structured learning reports mapped to educational frameworks including AITSL standards, Quality Teaching Model, and Visible Thinking Routines.",
  keywords: "professional development, education, AITSL, teaching standards, professional learning, AI analysis",
  authors: [{ name: "Pembroke School" }],
  openGraph: {
    title: "AI Professional Learning Reports",
    description: "Transform PD sessions into structured learning reports mapped to educational frameworks",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}