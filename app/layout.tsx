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
  title: "Milo - Premium AI Matchmaking",
  description: "Experience luxury matchmaking through intelligent conversation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col luxury-gradient text-gray-100 transition-all duration-500">
        {/* Subtle background pattern */}
        <div className="fixed inset-0 z-[-1] opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1)_0%,transparent_50%)]"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
