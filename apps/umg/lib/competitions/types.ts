export interface CompetitionDivision {
  id: string;
  name: string;
  ageRange: string;
  ageMin: number;
  ageMax: number;
  maxPhotos: number;
  maxDescriptionWords: number;
  biographyRequired: boolean;
  entryFee: number;
  requirements: string[];
  themeDescription: string[];
}

export interface CompetitionAward {
  place: string;
  recipientsPerDivision: number;
  amount: number;
}

export interface CompetitionTimeline {
  label: string;
  date: string;
  description?: string;
}

export interface EvaluationCriterion {
  name: string;
  description: string;
  maxScore: number;
}

export interface Competition {
  // Identity
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  year: number;
  status: "upcoming" | "open" | "closed" | "judging" | "complete";

  // Content
  themeIntro: string;
  themeDescription: string[];
  timeline: CompetitionTimeline[];
  divisions: CompetitionDivision[];
  awards: CompetitionAward[];
  exhibitionVenues: string[];

  // Photo rules
  acceptedFormats: string[];
  colorMode: string;
  maxFileSizeMB: number;
  minResolutionPx: number;
  allowedDevices: string[];

  // Rules text
  aiPolicy: string;
  originalityStatement: string;
  consentStatement: string;
  rightsStatement: string;

  // Judging
  evaluationCriteria: EvaluationCriterion[];
  divisionJudgingNotes: Record<string, string>;

  // Payment
  stripePaymentLink: string;

  // Submission config
  personalInfoFields: string[];
  exhibitionOptIn: boolean;
  exhibitionNote: string;
}
