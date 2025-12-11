import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./provider";
import { Navigation } from "./_components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Endless Outfitter",
  description: "Ship outfitting tool for Endless Sky",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}
      >
        <AppProvider>
          <Navigation />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
