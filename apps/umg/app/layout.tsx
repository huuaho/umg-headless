import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Franklin } from "next/font/google";
import localFont from "next/font/local";
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

const arizonaSans = localFont({
  src: "../fonts/ABCArizonaSans-Medium-Trial.otf",
  variable: "--font-arizona-sans",
});

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  weight: "600",
});

export const metadata: Metadata = {
  title: "United Media Group",
  description:
    "News aggregator for Diplomatic Watch, Echo Media, and International Spectrum",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${arizonaSans.variable} ${libreFranklin.variable} antialiased`}
      >
        <Header
          logoUrl="/umg-logo.svg"
          logoAlt="United Media Group"
          categories={categories}
          bannerCompanies={mediaCompanies}
          extraLinks={[
            { label: "2026 International Youth Photography Competition", href: "/how-to-enter" },
          ]}
        />
        {children}
        <Footer
          logoUrl="/umg-logo-black.svg"
          logoAlt="United Media Group"
          categories={categories}
          companies={mediaCompanies}
          email="unitedmediagroup196@gmail.com"
          copyright={"\u00A9 2026 United Media Group"}
          socials={[
            { platform: "x", url: "https://x.com/unitedmedia_dc" },
            { platform: "instagram", url: "https://www.instagram.com/unitedmediagroupdc/" },
          ]}
        />
      </body>
    </html>
  );
}
