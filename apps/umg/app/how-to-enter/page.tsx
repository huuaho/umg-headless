import Image from "next/image";
import Link from "next/link";
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
        </div>
      </section>

      {/* Our Sponsors */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
          Our Sponsors
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 max-w-3xl mx-auto">
          <Image
            src="/images/sponsors/international-salute.png"
            alt="International Salute"
            width={180}
            height={80}
            className="object-contain h-16 md:h-20 w-auto"
          />
          <Image
            src="/images/sponsors/chennault-foundation.png"
            alt="Chennault Foundation"
            width={180}
            height={80}
            className="object-contain h-16 md:h-20 w-auto"
          />
          <Image
            src="/images/sponsors/unesco-center-for-peace.jpg"
            alt="UNESCO Center for Peace"
            width={180}
            height={80}
            className="object-contain h-16 md:h-20 w-auto"
          />
        </div>
      </section>

      {/* Official Competition Rules */}
      <section className="max-w-280 mx-auto px-6 py-8 md:py-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
            Official Competition Rules, Terms, and Conditions
          </h2>
          <div className="space-y-6 text-xs text-gray-400 leading-relaxed">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">1. Eligibility and Compliance</h3>
              <ul className="space-y-2 list-disc pl-4">
                <li><strong>Verification of Compliance:</strong> The organizer reserves the right to verify original works and source materials to confirm they comply with these competition rules.</li>
                <li><strong>Acceptance of Terms:</strong> By completing the registration, you acknowledge and accept all rules and regulations of this competition.</li>
                <li><strong>Right to Verify Identity:</strong> The organizer reserves the right to verify the identity, address, and validity of any entrant. Any entrant who fails to comply with the official rules or interferes with the competition process by improper means may be disqualified. The organizer{"\u2019"}s failure to exercise this right promptly at any stage does not constitute a waiver of this right.</li>
                <li><strong>Originality:</strong> All submitted work must be original and created solely by the participant. Collaborative works are not accepted.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">2. Entry Validity and Disqualification</h3>
              <ul className="space-y-2 list-disc pl-4">
                <li><strong>Consequences of Violation:</strong> Entries that violate any of these rules will not be considered for judging, and the organizer reserves the right to remove them.</li>
                <li><strong>Post-Winning Disqualification:</strong> If a winning entry is found to be in violation of the rules, the organizer reserves the right to disqualify the winner and reclaim any certificates, prizes, and gifts already awarded.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">3. AI Policy and Image Integrity</h3>
              <ul className="space-y-2 list-disc pl-4">
                <li><strong>Prohibition of Generative AI:</strong> The use of generative or fully synthetic imagery in the final submitted work is prohibited. Works should not rely primarily on AI-generated content.</li>
                <li><strong>Value of Craftsmanship:</strong> While AI tools may be used during the creative or conceptual process, the competition places strong value on craftsmanship, authenticity, and the integrity of the photographic image.</li>
                <li><strong>Connection to Reality:</strong> All submissions must maintain a clear and recognizable connection to a real, photographed subject or scene.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">4. Participant Responsibility (Intellectual Property, Ethics & Permissions)</h3>
              <ul className="space-y-2 list-disc pl-4">
                <li><strong>Copyright and Liability:</strong> Participants shall be solely responsible for all legal consequences arising from copyright infringement, other infringements, or illegal activities related to their submitted work. The organizer shall not be held liable for such violations.</li>
                <li><strong>Ethical Representation:</strong> All submissions must respect the dignity, safety, and cultural context of the subjects represented.</li>
                <li><strong>Third-Party Content and Model Releases:</strong> If the submitted work contains materials not owned by the entrant (including but not limited to images, music, or video) or depicts any identifiable person:
                  <ul className="mt-1 space-y-1 list-disc pl-4">
                    <li>The entrant is responsible for obtaining all necessary authorization and consent from all relevant rights holders and/or subjects.</li>
                    <li>This consent must allow the work to be displayed and used in accordance with the {"\u201c"}Usage Rights{"\u201d"} section below, without requiring additional compensation.</li>
                    <li>If the person depicted is a minor, the entrant must ensure that a parent or legal guardian provides the consent.</li>
                    <li><strong>Documentation Requirement:</strong> In the event of a dispute, entrants must provide signed authorization documentation from each subject depicted to remain eligible. Failure to provide this documentation may result in disqualification at any time, and any prize won will be awarded to another entrant.</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">5. Ethical Standards for Photography</h3>
              <ul className="space-y-2 list-disc pl-4">
                <li><strong>Wildlife and Ecology Entries:</strong> Entries depicting wildlife or ecology are strictly prohibited from being staged, lured, or depicting animals in cages, traps, or controlled conditions that compromise the animal{"\u2019"}s welfare or the authenticity of the image.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">6. Rights and Usage</h3>
              <p className="mb-2">By participating, entrants grant the following rights to the organizer and its designated persons (collectively, the {"\u201c"}Authorized Parties{"\u201d"}):</p>
              <ul className="space-y-2 list-disc pl-4">
                <li><strong>Grant of Non-Exclusive Rights:</strong> By submitting works to the competition, participants grant the organizers a non-exclusive right to use selected images for competition-related purposes, including but not limited to exhibitions, publications, educational programs, and promotional materials.</li>
                <li><strong>Attribution:</strong> Full credit will be given to the photographer for any such use.</li>
                <li><strong>Retention of Copyright:</strong> The entrant retains full copyright ownership of the work.</li>
                <li><strong>Duration and Media:</strong>
                  <ul className="mt-1 space-y-1 list-disc pl-4">
                    <li>For general use (e.g., publicity, website display): A five-year term in any present or future media.</li>
                    <li>For winner publicity (e.g., public display of winning works): Perpetual rights.</li>
                  </ul>
                </li>
                <li><strong>Moral Rights Waiver:</strong> Entrants agree that the Authorized Parties may dispose of the submitted works without claiming any infringement of moral rights.</li>
                <li><strong>No Additional Fees:</strong> Publication of works by the Authorized Parties does not imply that the work will receive an award. The Authorized Parties will not be required to pay any additional fees or obtain additional consent for uses described in this section.</li>
                <li><strong>Use of Entrant{"\u2019"}s Likeness:</strong> Entrants grant the Authorized Parties an unlimited right to use any written descriptions, photographs, or representative images of the entrant in connection with this competition, without payment or additional consent.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">7. Limitation of Liability and Release</h3>
              <p className="mb-2">By participating, all entrants agree to release, waive, and hold harmless the organizer, United Media Group LLC, and its partners, affiliates, subsidiaries, advertising agencies, agents, and their respective employees, managers, directors, and representatives from any liability, loss, or damage arising from:</p>
              <ul className="space-y-1 list-disc pl-4 mb-3">
                <li>Participation in the competition and related activities.</li>
                <li>The acceptance, use, misuse, or possession of any prizes won.</li>
              </ul>
              <p className="mb-2">The organizer shall not be liable for:</p>
              <ul className="space-y-1 list-disc pl-4">
                <li>Errors, omissions, interference, deletion, or loss of data.</li>
                <li>Defects or delays caused by human operation or file transmission.</li>
                <li>Line failures, theft, or unauthorized access to entries.</li>
                <li>Technical malfunctions of telephone networks, computer systems, servers, or software.</li>
                <li>Delays in sending or receiving emails.</li>
                <li>Any damage to computer equipment caused by participating in the competition or uploading/downloading documents.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">8. Modification, Cancellation, and Force Majeure</h3>
              <ul className="space-y-2 list-disc pl-4">
                <li><strong>Interpretation and Amendments:</strong> Matters not covered in these rules shall be handled in accordance with detailed award descriptions. The organizer reserves the right to interpret, amend, and supplement these rules.</li>
                <li><strong>Right to Cancel or Suspend:</strong> If the competition cannot proceed as planned due to computer viruses, bugs, tampering, unauthorized intervention, fraud, technical failures, force majeure, or any other cause beyond the control of the organizer that corrupts or affects the administration, security, fairness, integrity, or proper conduct of the competition, the organizer reserves the right to:
                  <ul className="mt-1 space-y-1 list-disc pl-4">
                    <li>Disqualify any individual attempting to tamper with the process.</li>
                    <li>Cancel, terminate, modify, or suspend the competition.</li>
                  </ul>
                </li>
                <li><strong>Consequences of Cancellation:</strong> If the competition is canceled or terminated, the organizer will retain submitted works only for internal file management purposes and will refund all registration fees. No further rights to the works will be exercised.</li>
                <li><strong>Application Finality:</strong> Once the application is submitted, it is considered final, and the fee is non-refundable under any circumstances.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">9. Exhibition Disclaimer</h3>
              <p>The information provided regarding exhibition locations, schedules, and featured artworks is accurate at the time of publication. However, all elements are subject to change. The organizers reserve the right to make alterations without prior notification. We recommend checking our official website and social media channels for the most current information.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
