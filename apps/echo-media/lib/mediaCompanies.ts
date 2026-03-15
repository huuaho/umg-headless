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
    logo: "/images/banner/umg-masthead.png",
    logoBW: "/images/banner/umg-masthead-black.png",
  },
  {
    name: "International Spectrum Media",
    description:
      "Explores the richness of global cultures, sharing stories and experiences that promote cross-cultural understanding.",
    url: "https://www.internationalspectrum.org/",
    logo: "/images/banner/is-logo.svg",
    logoBW: "/images/banner/is-logo-black.svg",
  },
  {
    name: "Diplomatic Watch Magazine",
    description:
      "Delivers insightful analysis and in-depth reporting on international relations, building dialogue and understanding between countries.",
    url: "https://diplomaticwatch.com/",
    logo: "/images/banner/dw-logo.png",
    logoBW: "/images/banner/dw-logo-black.svg",
  },
];
