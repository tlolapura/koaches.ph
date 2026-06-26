import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fredoka, Poppins, DM_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "KoachesPH — Pickleball Coaching Platform",
    template: "%s — KoachesPH",
  },
  description: "Find coaches, track progress, and share your pickleball journey.",
  openGraph: {
    siteName: "KoachesPH",
    locale: "en_PH",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fredoka.variable} ${poppins.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg text-text">{children}</body>
    </html>
  );
}
