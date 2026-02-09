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
  title: "International Spectrum",
  description: "Exploring the richness of global cultures, sharing stories that promote cross-cultural understanding",
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
          logoUrl="https://api.unitedmediadc.com/wp-content/uploads/2025/12/IS-Logo.svg"
          logoAlt="International Spectrum"
          categories={categories}
          bannerCompanies={mediaCompanies}
        />
        {children}
        <Footer
          logoUrl="https://api.unitedmediadc.com/wp-content/uploads/2026/01/IS-Logo-Black.svg"
          logoAlt="International Spectrum"
          categories={categories}
          companies={mediaCompanies}
          email="unitedmediagroup196@gmail.com"
          copyright={"\u00A9 2026 International Spectrum Media"}
        />
      </body>
    </html>
  );
}
