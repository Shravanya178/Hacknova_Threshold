import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Threshold — Identity Curators",
  description: "Threshold is an agentic identity curator that diagnoses your current growth moment, composes the next meaningful experience, and continuously adapts as you grow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${caveat.variable} font-sans bg-background text-primaryText antialiased selection:bg-primaryAccent selection:text-secondaryBg`}
      >
        {children}
      </body>
    </html>
  );
}
