import type { Competition } from "./types";

export const currentCompetition: Competition = {
  // Identity
  id: "2026-youth-photography",
  slug: "2026/youth-photography",
  title: "My Hometown, My Lens",
  subtitle: "International Youth Photography Competition",
  year: 2026,
  status: "open",

  // Content
  themeIntro:
    "In a rapidly accelerating world, we recognize the importance of hometowns as places of origin and meaning. A hometown is not only a geographical location, but also a conceptual space where our journeys as human beings begin and where individual identities form.",

  themeDescription: [
    "This competition is an invitation: a warm welcome to slow down, look closely, and explore the spaces you call home. It's about uncovering the quiet, meaningful details that shape your sense of place and belonging. Through photography, you have the chance to capture not just images, but moments: fragments of time, memory, and everyday life that reveal the subtle, beautiful connections between you and your surroundings.",
    "We invite you to begin from where you are: from your own lived experiences, your own way of seeing the world. Whether your hometown is a bustling city street, a quiet village, a familiar neighborhood, or something more intangible; a feeling of origin rooted in memory, culture, relationships, or identity, your story is worth telling. There's no single narrative to follow, no prescribed style. What matters most is authenticity: your unique perspective, your sincere expression, your way of seeing the world.",
    "So pick up your camera, look around with fresh eyes, and let your images speak. We can't wait to see the places and stories you hold dear.",
  ],

  timeline: [
    {
      label: "Submissions Open",
      date: "March 16, 2026",
      description: "Global call for submissions opens",
    },
    {
      label: "Submission Deadline",
      date: "August 31, 2026",
      description: "Final deadline for all entries",
    },
    {
      label: "Jury Review",
      date: "September 1 – October 16, 2026",
      description: "Jury review and evaluation process",
    },
    {
      label: "Winners Announced",
      date: "October 16, 2026",
      description: "Official announcement of award recipients",
    },
    {
      label: "Exhibition Showcases",
      date: "December 2026 – March 2027",
      description:
        "Multiple exhibition showings at the cited locations",
    },
  ],

  divisions: [
    {
      id: "youth",
      name: "Youth Division",
      ageRange: "10–18 (including 18)",
      ageMin: 10,
      ageMax: 18,
      maxPhotos: 3,
      maxDescriptionWords: 100,
      biographyRequired: false,
      entryFee: 50,
      requirements: [
        "All participants must be actively enrolled students.",
        "Participants may submit up to three photographs.",
        "Images must be submitted in JPEG or JPG format, in RGB color mode, with a minimum resolution of 2000 pixels on the longest side and a maximum file size of 20 MB per image.",
        "Photographs may be taken using a camera, tablet, or smartphone.",
        "Photographs must be recent, taken during or after 2023.",
        "Each submission must include a title and an image description (max 100 words per image).",
        "A short biography is optional but recommended.",
      ],
      themeDescription: [
        "Written descriptions should focus on what the image shows and why it represents the participant's hometown.",
      ],
    },
    {
      id: "young-adults",
      name: "Young Adults Division",
      ageRange: "18–30 (excluding 18)",
      ageMin: 19,
      ageMax: 30,
      maxPhotos: 3,
      maxDescriptionWords: 200,
      biographyRequired: true,
      entryFee: 50,
      requirements: [
        "All participants must be actively enrolled students.",
        "Participants may submit up to three photographs.",
        "Images must be submitted in JPEG or JPG format, in RGB color mode, with a minimum resolution of 2000 pixels on the longest side and a maximum file size of 20 MB per image.",
        "Photographs may be taken using a camera, tablet, or smartphone.",
        "Photographs must be recent, taken during or after 2023.",
        "Each submission must include a title, an image description (max 200 words per image), and a short biography.",
        "Descriptions should explain the photograph's context, the participant's personal perspective, and its connection to the competition theme.",
      ],
      themeDescription: [
        "Participants are encouraged to demonstrate intentional composition and conceptual clarity while remaining true to personal experience.",
      ],
    },
  ],

  awards: [
    { place: "First Prize", recipientsPerDivision: 1, amount: 8000 },
    { place: "Second Prize", recipientsPerDivision: 2, amount: 4000 },
    { place: "Third Prize", recipientsPerDivision: 3, amount: 2000 },
    { place: "Honorable Mention", recipientsPerDivision: 20, amount: 500 },
  ],

  exhibitionVenues: [
    "Library of Congress",
    "Smithsonian Museum",
    "Press Club",
    "Georgetown University",
    "Johns Hopkins University",
  ],

  // Photo rules
  acceptedFormats: ["JPEG", "JPG"],
  colorMode: "RGB",
  maxFileSizeMB: 20,
  minResolutionPx: 2000,
  allowedDevices: ["camera", "tablet", "smartphone"],

  // Rules text
  aiPolicy:
    "Works should not rely primarily on generative or fully synthetic imagery, and the use of AI in the final submitted work is prohibited. While AI tools may be used during the creative or conceptual process, the competition places strong value on craftsmanship, authenticity, and the integrity of the photographic image. All submissions must maintain a clear and recognizable connection to a real, photographed subject or scene.",

  originalityStatement:
    "I confirm that all submitted work is my original creation and based on authentic photographic images. I certify that the images were not generated by artificial intelligence and do not rely on fully synthetic or AI-generated content.",

  consentStatement:
    "I confirm that I have obtained consent from all individuals who are clearly identifiable in my photographs and that my submissions respect the dignity, safety, and cultural context of all subjects.",

  rightsStatement:
    "I confirm that I am the creator and copyright holder of the submitted images and grant the organizers of My Hometown, My Lens: International Youth Photography Competition the non-exclusive right to use my submitted photographs for competition-related purposes, including exhibitions, publications, educational programs, and promotional materials, with proper credit given. I understand that once the application fee is submitted, my entry is final and the application fee is non-refundable.",

  // Judging
  evaluationCriteria: [
    {
      name: "Relevance to the Theme",
      description:
        "The extent to which the work responds thoughtfully to the theme My Hometown, My Lens, and reflects a meaningful engagement with the idea of hometown.",
    },
    {
      name: "Authenticity and Sincerity of Expression",
      description:
        "The honesty of the participant's perspective and the degree to which the work feels personal, grounded, and true to lived experience.",
    },
    {
      name: "Clarity of Personal Perspective",
      description:
        "How clearly the participant's point of view, intention, or relationship to the subject is communicated through the image.",
    },
    {
      name: "Visual Storytelling and Composition",
      description:
        "The effectiveness of composition, framing, timing, and visual structure in conveying meaning and narrative.",
    },
    {
      name: "Humanistic Insight and Cultural Value",
      description:
        "The work's ability to reflect cultural context, human relationships, or shared experiences, and to contribute to understanding across differences.",
    },
    {
      name: "Technical Execution",
      description:
        "Technical quality evaluated relative to the participant's age, educational level, and artistic intent, rather than as an absolute standard.",
    },
  ],

  divisionJudgingNotes: {
    youth:
      "Greater emphasis should be placed on observation, emotional expression, and effort rather than technical mastery.",
    "young-adults":
      "Greater emphasis may be placed on conceptual depth, visual intention, and social or cultural awareness.",
  },

  // Payment
  stripePaymentLink: "https://buy.stripe.com/cNiaEWdBO7c5b8q6tSgfu00",

  // Submission config
  personalInfoFields: ["name", "dob", "address", "school", "grade", "job"],
  exhibitionOptIn: true,
  exhibitionNote:
    "Would you like to be featured in the upcoming exhibitions? There is an additional fee to participate, and artists will receive a payment link via email at a future date.",
};
