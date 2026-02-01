// Simulated API response data for development

export interface FeaturedArticle {
  title: string;
  snippet: string;
  time: string;
  gallery: string | string[]; // Single image or array for gallery carousel
}

export interface SecondaryArticle {
  title: string;
  time: string;
}

// Section Type 4 - simpler structure with 4 equal articles
export interface Type4Article {
  title: string;
  time: string;
  image?: string; // Optional - only used when textOnly is false
}

export interface SectionType4Data {
  articles: Type4Article[];
}

// All section types share the same data structure
// The display (gallery vs single image) is determined by the gallery value
// Category is passed separately by the page, not included in data
export interface SectionData {
  featured: FeaturedArticle;
  secondary: SecondaryArticle[];
}

export const sectionType1Data: SectionData = {
  featured: {
    title: "Thousands demonstrate in Minnesota and across US to protest ICE",
    snippet:
      "Thousands of protesters took to the streets in Minneapolis and students across the United States staged walkouts on Friday to demand the withdrawal of federal immigration agents from Minnesota following the fatal shootings of two U.S. citizens.",
    time: "7 min read",
    gallery: [
      "https://picsum.photos/seed/news1/900/600",
      "https://picsum.photos/seed/news2/900/600",
      "https://picsum.photos/seed/news3/900/600",
    ],
  },
  secondary: [
    {
      title:
        "US Justice Dept opens civil rights probe into Alex Pretti shooting, official says",
      time: "4 min read",
    },
    {
      title:
        "Ex-CNN journalist Don Lemon arrested after anti-ICE church protest in Minnesota",
      time: "3 min read",
    },
    {
      title:
        "New York governor proposes bill to ban local law enforcement from being deputized by ICE",
      time: "5 min read",
    },
    {
      title:
        "Lawsuit challenges ICE ability to enter homes without warrants from US judges",
      time: "6 min read",
    },
  ],
};

export const sectionType2Data: SectionData = {
  featured: {
    title: "Global leaders gather for historic climate summit in Geneva",
    snippet:
      "World leaders from over 150 countries have convened in Geneva for what is being called the most significant climate conference since the Paris Agreement, with ambitious new targets expected to be announced.",
    time: "8 min read",
    gallery: "https://picsum.photos/seed/type2feat/900/600",
  },
  secondary: [
    {
      title:
        "UN Secretary-General calls for immediate action on carbon emissions",
      time: "4 min read",
    },
    {
      title:
        "Small island nations demand stronger commitments from industrialized countries",
      time: "5 min read",
    },
    {
      title: "Tech giants pledge billions toward renewable energy initiatives",
      time: "3 min read",
    },
    {
      title:
        "Youth activists stage peaceful demonstration outside conference venue",
      time: "2 min read",
    },
  ],
};

export const sectionType3Data: SectionData = {
  featured: {
    title: "Central banks signal coordinated approach to interest rate policy",
    snippet:
      "Major central banks around the world are signaling a more coordinated approach to monetary policy as global inflation concerns persist and economic growth forecasts remain uncertain.",
    time: "6 min read",
    gallery: "https://picsum.photos/seed/type3feat/900/600",
  },
  secondary: [
    {
      title: "Stock markets rally on positive earnings reports from tech sector",
      time: "3 min read",
    },
    {
      title: "Supply chain disruptions continue to impact manufacturing globally",
      time: "4 min read",
    },
    {
      title: "Emerging markets show resilience despite currency volatility",
      time: "5 min read",
    },
  ],
};

// Section Type 4 - with images variant
export const sectionType4Data: SectionType4Data = {
  articles: [
    {
      title:
        "Catherine O'Hara, star of 'Schitt's Creek' and 'Home Alone,' dead at 71",
      time: "4 min read",
      image: "https://picsum.photos/seed/type4a1/900/600",
    },
    {
      title: "Baby long-necked dinosaurs were a 'perfect snack' for predators",
      time: "3 min read",
      image: "https://picsum.photos/seed/type4a2/900/600",
    },
    {
      title:
        "Survival showdown in 'Send Help' is full of firsts for star Rachel McAdams",
      time: "5 min read",
      image: "https://picsum.photos/seed/type4a3/900/600",
    },
    {
      title:
        "Galaxy cluster observed forming surprisingly early in universe's history",
      time: "6 min read",
      image: "https://picsum.photos/seed/type4a4/900/600",
    },
  ],
};

// Section Type 4 - text only variant
export const sectionType4TextOnlyData: SectionType4Data = {
  articles: [
    {
      title:
        "Bitcoin falls below $80,000, continuing decline as liquidity worries mount",
      time: "3 min read",
    },
    {
      title:
        "Japan's Takaichi cites weak yen's benefits even as her government threatens intervention",
      time: "4 min read",
    },
    {
      title:
        "Wall St Week Ahead Heavy earnings week, jobs data to test US stocks after Microsoft swoon",
      time: "5 min read",
    },
    {
      title:
        "Boeing reaches labor deal with former Spirit AeroSystems white-collar workers",
      time: "2 min read",
    },
  ],
};
