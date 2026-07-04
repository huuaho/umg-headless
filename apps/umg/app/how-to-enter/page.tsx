import Image from "next/image";
import Link from "next/link";
import { currentCompetition } from "@/lib/competitions/current";
import { judges } from "@/lib/competitions/judges";
import { CompetitionDivisions } from "@/components/CompetitionDivisions";
import { PhotoRequirements } from "@/components/PhotoRequirements";
import { CompetitionRules } from "@/components/CompetitionRules";
import { HostingCommittees } from "@/components/HostingCommittees";

const competition = currentCompetition;

export const metadata = {
  title: `${competition.title} — ${competition.subtitle}`,
  description: `${competition.subtitle} from United Media Group, open to photographers ages 10–30 worldwide. First Prize $${competition.awards[0].amount.toLocaleString()} per division. Winners exhibited at ${competition.exhibitionVenues.slice(0, 2).join(" and ")} in Washington, DC.`,
};

// Facts below derive from lib/competitions/current.ts so schema and visible
// copy can't drift from the competition config (AEO tickets 07/08).
const submissionDeadline = competition.timeline.find((t) =>
  t.label.toLowerCase().includes("deadline")
);

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `${competition.title}: ${competition.subtitle} ${competition.year}`,
  organizer: {
    "@type": "Organization",
    name: "United Media Group",
    url: "https://unitedmediadc.com",
  },
  description: `${competition.subtitle} organized by United Media Group. Open worldwide to photographers ages 10–30 across two divisions. First Prize $${competition.awards[0].amount.toLocaleString()} per division. Winning work is exhibited at ${competition.exhibitionVenues.join(", ")} in Washington, DC.`,
  startDate: "2026-03-16", // timeline: Submissions Open
  endDate: "2027-03-31", // timeline: Exhibition Showcases conclude
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  location: { "@type": "Place", name: "Washington, DC" },
  typicalAgeRange: "10-30",
  offers: {
    "@type": "Offer",
    price: String(competition.divisions[0].entryFee),
    priceCurrency: "USD",
    url: "https://unitedmediadc.com/photo-submission/",
  },
};

const awardsSummary = competition.awards
  .map(
    (a) =>
      `${a.recipientsPerDivision} ${a.place}${a.recipientsPerDivision > 1 ? "s" : ""} of $${a.amount.toLocaleString()}`
  )
  .join(", ");

const faqs = [
  {
    question: `Who can enter the ${competition.title} competition?`,
    answer: `The competition is an international call open to young photographers ages 10 to 30. There are two divisions: the ${competition.divisions[0].name} (ages ${competition.divisions[0].ageRange}) and the ${competition.divisions[1].name} (ages ${competition.divisions[1].ageRange}).`,
  },
  {
    question: "How much does it cost to enter?",
    answer: `The entry fee is $${competition.divisions[0].entryFee}. Each entrant may submit up to ${competition.divisions[0].maxPhotos} photographs in their division.`,
  },
  {
    question: "What are the prizes?",
    answer: `Each division awards ${awardsSummary}. All award recipients receive official certificates and are invited to featured exhibitions.`,
  },
  {
    question: "When is the submission deadline?",
    answer: `All entries must be submitted by ${submissionDeadline?.date ?? "the deadline listed in the competition timeline"}.`,
  },
  {
    question: "Where will winning photographs be exhibited?",
    answer: `Award recipients are invited to featured exhibitions at ${competition.exhibitionVenues.join(", ")} in Washington, DC.`,
  },
  {
    question: "What are the photo requirements?",
    answer: `Images must be submitted in ${competition.acceptedFormats.join(" or ")} format, in ${competition.colorMode} color mode, with a minimum resolution of ${competition.minResolutionPx} pixels on the longest side and a maximum file size of ${competition.maxFileSizeMB} MB per image.`,
  },
  {
    question: "Is AI-generated imagery allowed?",
    answer: competition.aiPolicy,
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

const venueImages: Record<string, string> = {
  "Library of Congress": "/images/venues/library-of-congress.jpg",
  "Smithsonian Museum": "/images/venues/smithsonian-museum.jpg",
  "Press Club": "/images/venues/press-club.jpg",
  "Georgetown University": "/images/venues/georgetown-university.jpg",
  "Johns Hopkins University": "/images/venues/johns-hopkins-university.jpg",
};

export default function HowToEnterPage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Hero Banner */}
      <section className="w-full bg-linear-to-r from-[#7EC8E3] via-[#A8D5E8] to-[#C5B8D9] px-6 py-16 md:py-24">
        <div className="max-w-280 mx-auto flex justify-center">
          <h1 className="font-[family-name:var(--font-libre-franklin)] font-semibold uppercase leading-[0.95] inline-grid">
            <span className="block text-4xl md:text-7xl lg:text-8xl text-[#1565A0]">
              My Hometown
            </span>
            <span className="flex items-end justify-between mt-1">
              <span className="text-4xl md:text-7xl lg:text-8xl text-white">
                My Lens
              </span>
              <span className="text-[8px] md:text-base lg:text-2xl normal-case font-normal leading-tight text-right mb-2">
                <span className="text-[#1565A0]">International Youth</span>
                <br />
                <span className="text-white">Photography Competition</span>
              </span>
            </span>
          </h1>
        </div>
      </section>

      {/* Theme Intro */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <p className="text-gray-600 text-center max-w-3xl mx-auto leading-relaxed text-lg">
          {competition.themeIntro}
        </p>
      </section>

      {/* Theme Description */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-280 mx-auto px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-8">
            About the Theme
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {competition.themeDescription.map((paragraph, i) => (
              <p key={i} className="text-gray-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
          Competition Timeline
        </h2>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-300 hidden md:block" />
            <div className="space-y-8">
              {competition.timeline.map((step, i) => (
                <div key={i} className="flex gap-6 items-start">
                  {/* Step number */}
                  <div className="shrink-0 w-8 h-8 rounded-full bg-[#212223] text-white text-sm font-bold flex items-center justify-center relative z-10">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {step.date}
                    </p>
                    <p className="text-lg font-semibold text-[#212223]">
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="text-gray-600 mt-1">{step.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CompetitionDivisions />

      <PhotoRequirements />

      {/* Awards */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-280 mx-auto px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
            Awards & Recognition
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {competition.awards.map((award) => (
                <div key={award.place} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-[#212223]">
                    ${award.amount.toLocaleString()}
                  </p>
                  <p className="text-sm font-semibold text-[#212223] mt-1">
                    {award.place}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {award.recipientsPerDivision} per division
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-2">
                All award recipients will receive official certificates and be
                invited to featured exhibitions at:
              </p>
              <p className="text-sm text-gray-500">
                {competition.exhibitionVenues.join(" · ")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exhibition Locations */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
          Exhibition Locations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {competition.exhibitionVenues.map((venue, i) => (
            <div
              key={i}
              className={
                i === competition.exhibitionVenues.length - 1 &&
                competition.exhibitionVenues.length % 2 !== 0
                  ? "md:col-span-2 md:flex md:justify-center"
                  : ""
              }
            >
              <div
                className={
                  i === competition.exhibitionVenues.length - 1 &&
                  competition.exhibitionVenues.length % 2 !== 0
                    ? "md:w-1/2 w-full"
                    : ""
                }
              >
                <div className="relative aspect-3/2 bg-gray-200 overflow-hidden">
                  <Image
                    src={venueImages[venue] || ""}
                    alt={venue}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <p className="text-sm font-medium text-[#212223] mt-2 text-center">
                  {venue}
                </p>
              </div>
            </div>
          ))}
        </div>
        {competition.exhibitionNote && (
          <p className="text-gray-600 text-center mt-8 max-w-2xl mx-auto">
            {competition.exhibitionNote}
          </p>
        )}
      </section>

      {/* Evaluation Criteria */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-280 mx-auto px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
            Evaluation Criteria
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {competition.evaluationCriteria.map((criterion, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-[#212223] text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#212223]">
                      {criterion.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {criterion.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Judges */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
          <Link href="/judges-panel" className="hover:text-[#1565A0] transition-colors">
            Meet the Judges
          </Link>
        </h2>
        <div className="flex flex-wrap justify-center gap-8 md:gap-10 max-w-4xl mx-auto">
          {judges.map((judge) => (
            <a
              key={judge.id}
              href={`/judges-panel#${judge.id}`}
              className="text-center w-40 md:w-48 group"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gray-100 border border-gray-200 mx-auto relative group-hover:shadow-md transition-shadow">
                <Image
                  src={judge.image}
                  alt={judge.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 160px"
                />
              </div>
              <div className="mt-3 space-y-0.5">
                <p className="text-sm md:text-base font-semibold text-[#212223] group-hover:text-[#1565A0] transition-colors">
                  {judge.name}
                </p>
                <p className="text-xs md:text-sm text-gray-500">
                  {judge.title}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-r from-[#7EC8E3] via-[#A8D5E8] to-[#C5B8D9] font-[family-name:var(--font-libre-franklin)] uppercase">
        <div className="max-w-280 mx-auto px-6 py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[#1565A0]">
            Ready to Submit?
          </h2>
          <p className="text-gray-700 mb-6 max-w-lg mx-auto normal-case">
            Share your perspective. Show us the places and stories that shaped
            who you are.
          </p>
          <a
            href="/photo-submission"
            className="inline-block px-8 py-3 bg-[#1565A0] text-white font-bold hover:bg-[#124f82] transition-colors"
          >
            Apply Now
          </a>
          <p className="mt-4 normal-case text-sm text-[#1565A0]">
            Registering on behalf of a school?{" "}
            <a href="/school-registration" className="underline font-semibold hover:text-[#124f82]">
              Apply as a school
            </a>
          </p>
        </div>
      </section>

      <CompetitionRules />

      {/* FAQ — visible content backing the FAQPage schema above (AEO ticket 08) */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-lg font-semibold text-[#212223] mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <HostingCommittees />
    </main>
  );
}
