import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth";
import { ItineraryProvider } from "@/features/itinerary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel Planner",
  description: "Ứng dụng lập kế hoạch chuyến đi",
  other: {
    'goong-css': '<link href="https://cdn.jsdelivr.net/npm/goong-js@latest/dist/goong.css" rel="stylesheet" />',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased light`}
    >
      <head>
        <link href="https://cdn.jsdelivr.net/npm/goong-js@latest/dist/goong.css" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col text-slate-900 font-sans">
        <ItineraryProvider>
          <AuthProvider>{children}</AuthProvider>
        </ItineraryProvider>
      </body>
    </html>
  );
}
