// Simulated API response data for development

export interface FeaturedArticle {
  title: string;
  snippet: string;
  time: string;
  gallery: string[];
}

export interface SecondaryArticle {
  title: string;
  time: string;
}

export interface SectionType1Data {
  category: string; // Category name displayed as section label
  featured: FeaturedArticle;
  secondary: SecondaryArticle[];
}

// Section Type 2: Single image instead of gallery
export interface FeaturedArticleType2 {
  title: string;
  snippet: string;
  time: string;
  image: string; // Single image instead of gallery
}

export interface SectionType2Data {
  category: string;
  featured: FeaturedArticleType2;
  secondary: SecondaryArticle[];
}

export const sectionType1Data: SectionType1Data = {
  category: "United States",
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

export const sectionType2Data: SectionType2Data = {
  category: "Profiles & Opinions",
  featured: {
    title: "Global leaders gather for historic climate summit in Geneva",
    snippet:
      "World leaders from over 150 countries have convened in Geneva for what is being called the most significant climate conference since the Paris Agreement, with ambitious new targets expected to be announced.",
    time: "8 min read",
    image: "https://picsum.photos/seed/type2feat/900/600",
  },
  secondary: [
    {
      title: "UN Secretary-General calls for immediate action on carbon emissions",
      time: "4 min read",
    },
    {
      title: "Small island nations demand stronger commitments from industrialized countries",
      time: "5 min read",
    },
    {
      title: "Tech giants pledge billions toward renewable energy initiatives",
      time: "3 min read",
    },
    {
      title: "Youth activists stage peaceful demonstration outside conference venue",
      time: "2 min read",
    },
  ],
};
