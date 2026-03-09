import Image from "next/image";
import { currentCompetition } from "@/lib/competitions/current";
import { judges } from "@/lib/competitions/judges";

const competition = currentCompetition;

const venueImages: Record<string, string> = {
  "Library of Congress": "/images/venues/library-of-congress.jpg",
  "Smithsonian Museum": "/images/venues/smithsonian-museum.webp",
  "Press Club": "/images/venues/press-club.jpg",
  "Georgetown University": "/images/venues/georgetown-university.jpg",
  "Johns Hopkins University": "/images/venues/johns-hopkins-university.jpg",
};

export default function HowToEnterPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="w-full bg-gradient-to-r from-[#7EC8E3] via-[#A8D5E8] to-[#C5B8D9] px-6 py-16 md:py-24">
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
          Timeline
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

      {/* Divisions */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-280 mx-auto px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
            Divisions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {competition.divisions.map((division) => (
              <div
                key={division.id}
                className="bg-white border border-gray-200 p-6 md:p-8"
              >
                <h3 className="text-xl font-bold text-[#212223] mb-1">
                  {division.name}
                </h3>
                <p className="text-gray-500 mb-4">Ages {division.ageRange}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Entry Fee</span>
                    <span className="font-semibold text-[#212223]">
                      ${division.entryFee}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Max Photos</span>
                    <span className="font-semibold text-[#212223]">
                      {division.maxPhotos}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Description Limit</span>
                    <span className="font-semibold text-[#212223]">
                      {division.maxDescriptionWords} words
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Biography</span>
                    <span className="font-semibold text-[#212223]">
                      {division.biographyRequired ? "Required" : "Optional"}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-3">
                  Requirements
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {division.requirements.map((req, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-gray-400 mr-2 mt-0.5">&bull;</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>

                {competition.divisionJudgingNotes[division.id] && (
                  <>
                    <h4 className="text-sm font-semibold text-[#212223] uppercase tracking-wide mb-2 mt-6">
                      Division-Specific Notes
                    </h4>
                    <p className="text-sm text-gray-600">
                      {competition.divisionJudgingNotes[division.id]}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Requirements */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
          Photo Requirements
        </h2>
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="text-center p-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                Format
              </p>
              <p className="text-lg font-semibold text-[#212223]">
                {competition.acceptedFormats.join(" / ")}
              </p>
            </div>
            <div className="text-center p-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                Color Mode
              </p>
              <p className="text-lg font-semibold text-[#212223]">
                {competition.colorMode}
              </p>
            </div>
            <div className="text-center p-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                Min Resolution
              </p>
              <p className="text-lg font-semibold text-[#212223]">
                {competition.minResolutionPx.toLocaleString()}px
              </p>
              <p className="text-xs text-gray-400">longest side</p>
            </div>
            <div className="text-center p-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
                Max File Size
              </p>
              <p className="text-lg font-semibold text-[#212223]">
                {competition.maxFileSizeMB} MB
              </p>
              <p className="text-xs text-gray-400">per image</p>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-6 text-sm">
            Allowed devices:{" "}
            {competition.allowedDevices
              .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
              .join(", ")}
          </p>
        </div>
      </section>

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
        <p className="text-gray-600 text-center mt-8 max-w-2xl mx-auto">
          Would you like your photography to be featured in the upcoming
          exhibitions? There is an additional fee to participate, and artists
          will receive a payment link via email at a future date.
        </p>
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
          Meet the Judges
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
      <section className="bg-[#212223] text-white">
        <div className="max-w-280 mx-auto px-6 py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Submit?
          </h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            Share your perspective. Show us the places and stories that shaped
            who you are.
          </p>
          <a
            href="/photo-submission"
            className="inline-block px-8 py-3 border border-white text-white font-medium hover:bg-white hover:text-[#212223] transition-colors"
          >
            Apply Now
          </a>
        </div>
      </section>

      {/* Rules & Guidelines */}
      <section className="max-w-280 mx-auto px-6 py-8 md:py-10">
        <h2 className="text-lg font-medium text-center text-gray-400 mb-6">
          Rules & Guidelines
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              AI Policy & Image Integrity
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {competition.aiPolicy}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              Originality & Ethics
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              All submitted work must be original and created solely by the
              participant; collaborative work is not accepted. Participants are
              responsible for obtaining consent from individuals who are clearly
              identifiable in the photographs. All submissions should respect
              the dignity, safety, and cultural context of the subjects
              represented.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              Rights & Usage
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              By submitting works to the competition, participants grant the
              organizers the non-exclusive right to use selected images for
              competition-related purposes, including exhibitions, publications,
              educational programs, and promotional materials, with full credit
              given to the photographer. Copyright remains with the artist. Once
              the application is submitted, it is considered final, and the fee
              is non-refundable under any circumstances.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
