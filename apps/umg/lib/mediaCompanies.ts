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
    logo: "/images/banner/em-logo.svg",
    logoBW: "/images/banner/em-logo-black.png",
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
    logo: "/images/banner/dw-logo.svg",
    logoBW: "/images/banner/dw-logo-black.svg",
  },
];
