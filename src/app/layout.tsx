import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'Intrinsic Workcell Command Center — Customer-Facing Dashboard Prototype',
  description: 'A production-grade monitoring dashboard for Intrinsic-powered industrial workcells. Built by Parva Raval as a PM Intern application artifact.',
  openGraph: {
    title: 'Intrinsic Workcell Command Center',
    description: 'Real-time monitoring for AI-powered industrial robotics. Prototype by Parva Raval.',
    type: 'website',
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
