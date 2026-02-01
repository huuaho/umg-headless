export interface MediaCompany {
  name: string;
  description: string;
  url: string;
  logo: string;
  logoBW: string;
}

export const mediaCompanies: MediaCompany[] = [
  {
    name: "Echo Media",
    description:
      "Focuses on educational content, providing resources and stories that inspire learning and personal development.",
    url: "https://www.echo-media.info/",
    logo: "https://www.unitedmediadc.com/wp-content/uploads/2025/12/EM-Logo.svg",
    logoBW: "https://www.unitedmediadc.com/wp-content/uploads/2026/01/EM-Logo-Black-scaled.png",
  },
  {
    name: "International Spectrum Media",
    description:
      "Explores the richness of global cultures, sharing stories and experiences that promote cross-cultural understanding.",
    url: "https://www.internationalspectrum.org/",
    logo: "https://www.unitedmediadc.com/wp-content/uploads/2025/12/IS-Logo.svg",
    logoBW: "https://www.unitedmediadc.com/wp-content/uploads/2026/01/IS-Logo-Black.svg",
  },
  {
    name: "Diplomatic Watch Magazine",
    description:
      "Delivers insightful analysis and in-depth reporting on international relations, building dialogue and understanding between countries.",
    url: "https://diplomaticwatch.com/",
    logo: "https://www.unitedmediadc.com/wp-content/uploads/2025/12/DW-banner.png",
    logoBW: "https://www.unitedmediadc.com/wp-content/uploads/2026/01/DW-Logo-Black.svg",
  },
];
