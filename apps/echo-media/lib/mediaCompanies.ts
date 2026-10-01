export interface MediaCompany {
  name: string;
  description: string;
  url: string;
  logo: string;
  logoBW: string;
}

export const mediaCompanies: MediaCompany[] = [
  {
    name: "United Media Group",
    description:
      "A network of media companies committed to sharing stories that inspire hope, connection, and positive change.",
    url: "https://www.unitedmediadc.com/",
    logo: "/images/banner/umg-masthead.svg",
    logoBW: "/images/banner/umg-masthead-black.svg",
  },
  {
    name: "International Spectrum Media",
    description:
      "Explores the richness of global cultures, sharing stories and experiences that promote cross-cultural understanding.",
    url: "https://www.internationalspectrum.org/",
    logo: "/images/banner/is-logo.svg",
    logoBW: "/images/banner/is-logo-black.svg",
  },
];
