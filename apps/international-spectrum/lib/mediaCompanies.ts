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
    name: "Echo Media",
    description:
      "Focuses on educational content, providing resources and stories that inspire learning and personal development.",
    url: "https://www.echo-media.info/",
    logo: "https://api.unitedmediadc.com/wp-content/uploads/2025/12/EM-Logo.svg",
    logoBW: "https://api.unitedmediadc.com/wp-content/uploads/2026/01/EM-Logo-Black-scaled.png",
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
