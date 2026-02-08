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
    logo: "https://api.unitedmediadc.com/wp-content/uploads/2025/12/UMG-Masthead.svg",
    logoBW: "https://api.unitedmediadc.com/wp-content/uploads/2026/01/UMG-Masthead-Black.svg",
  },
  {
    name: "International Spectrum Media",
    description:
      "Explores the richness of global cultures, sharing stories and experiences that promote cross-cultural understanding.",
    url: "https://www.internationalspectrum.org/",
    logo: "https://api.unitedmediadc.com/wp-content/uploads/2025/12/IS-Logo.svg",
    logoBW: "https://api.unitedmediadc.com/wp-content/uploads/2026/01/IS-Logo-Black.svg",
  },
  {
    name: "Diplomatic Watch Magazine",
    description:
      "Delivers insightful analysis and in-depth reporting on international relations, building dialogue and understanding between countries.",
    url: "https://diplomaticwatch.com/",
    logo: "https://api.unitedmediadc.com/wp-content/uploads/2025/12/DW-banner.png",
    logoBW: "https://api.unitedmediadc.com/wp-content/uploads/2026/01/DW-Logo-Black.svg",
  },
];
