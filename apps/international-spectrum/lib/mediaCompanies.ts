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
    name: "Echo Media",
    description:
      "Focuses on educational content, providing resources and stories that inspire learning and personal development.",
    url: "https://www.echo-media.info/",
    logo: "/images/banner/em-logo.svg",
    logoBW: "/images/banner/em-logo-black.png",
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
