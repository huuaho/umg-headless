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

const SITE_URL = "https://unitedmediadc.com";
const SITE_DESCRIPTION =
  "Washington DC's multicultural media organization, covering diplomatic affairs, community stories, and international perspectives through Diplomatic Watch, Echo Media, and International Spectrum.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "United Media Group | DC Multicultural Media",
    template: "%s | United Media Group",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "United Media Group",
    description:
      "DC multicultural media. Diplomatic Watch. Echo Media. International Spectrum.",
    url: SITE_URL,
    siteName: "United Media Group",
    // Interim image until the designed 1200x630 OG asset lands (ticket 09)
    images: [{ url: "/images/venues/library-of-congress.jpg", width: 1920, height: 1280 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@unitedmedia_dc",
    title: "United Media Group",
    description:
      "DC multicultural media. Diplomatic Watch. Echo Media. International Spectrum.",
    images: ["/images/venues/library-of-congress.jpg"],
  },
};

// Machine-readable identity card for AI/search crawlers (AEO ticket 01).
// sameAs must stay in sync with the Footer socials below.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "United Media Group",
  alternateName: "UMG",
  url: SITE_URL,
  logo: `${SITE_URL}/umg-logo.png`,
  description: SITE_DESCRIPTION,
  email: "info@unitedmediadc.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Washington",
    addressRegion: "DC",
    addressCountry: "US",
  },
  sameAs: [
    "https://x.com/unitedmedia_dc",
    "https://www.instagram.com/unitedmediagroupdc/",
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Header
          logoUrl="/umg-logo.svg"
          logoAlt="United Media Group"
          categories={categories}
          bannerCompanies={mediaCompanies}
          extraLinks={[
            { label: "2026 International Youth Photography Competition", href: "/how-to-enter" },
          ]}
          announcementBanner={{
            text: "2026 International Youth Photography Competition: My Hometown, My Lens",
            href: "/how-to-enter",
          }}
        />
        {children}
        <Footer
          logoUrl="/umg-logo-black.svg"
          logoAlt="United Media Group"
          categories={categories}
          companies={mediaCompanies}
          email="info@unitedmediadc.com"
          contactHref="/contact"
          copyright={"\u00A9 2026 United Media Group"}
          socials={[
            { platform: "x", url: "https://x.com/unitedmedia_dc" },
            { platform: "instagram", url: "https://www.instagram.com/unitedmediagroupdc/" },
          ]}
          apiBaseUrl={process.env.NEXT_PUBLIC_WP_API_URL}
        />
      </body>
    </html>
  );
}
