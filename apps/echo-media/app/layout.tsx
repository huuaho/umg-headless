import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header, Footer } from "@umg/ui";
import { categories } from "@/lib/categories";
import { mediaCompanies } from "@/lib/mediaCompanies";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Echo Media",
  description: "Educational content, resources, and stories that inspire learning and personal development",
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
        <Header
          logoUrl="/images/banner/em-logo.svg"
          logoAlt="Echo Media"
          categories={categories}
          bannerCompanies={mediaCompanies}
        />
        {children}
        <Footer
          logoUrl="/images/banner/em-logo-black.png"
          logoAlt="Echo Media"
          categories={categories}
          companies={mediaCompanies}
          email="unitedmediagroup196@gmail.com"
          copyright={"\u00A9 2026 Echo Media"}
        />
      </body>
    </html>
  );
}
