import Link from "next/link";
import { HostingCommittees } from "@/components/HostingCommittees";

export const metadata = {
  title: "About United Media Group",
  description:
    "United Media Group is Washington DC's multicultural media organization, covering diplomatic affairs, community stories, and international perspectives through Diplomatic Watch, Echo Media, and International Spectrum.",
};

// Visible FAQ + FAQPage schema share this array so they can't drift (AEO ticket 08)
const faqs = [
  {
    question: "What does United Media Group cover?",
    answer:
      "United Media Group is Washington DC's multicultural media organization. It publishes content across three pillars: Diplomatic Watch (diplomatic and ambassador affairs), Echo Media (DC community stories and local profiles), and International Spectrum (multicultural and international perspectives).",
  },
  {
    question: "Where is United Media Group based?",
    answer:
      "United Media Group is based in Washington, DC, covering the city's diplomatic corridor and multicultural neighborhoods.",
  },
  {
    question: "How can I contact United Media Group?",
    answer:
      "Email info@unitedmediadc.com, or reach out on Instagram (@unitedmediagroupdc) or X (@unitedmedia_dc).",
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

const platforms = [
  {
    name: "Diplomatic Watch",
    tagline: "WHERE DC MEETS THE WORLD",
    description:
      "Diplomatic Watch covers Washington's diplomatic community: ambassador profiles, cultural exchanges, embassy events, and the stories behind the flags that line Massachusetts Avenue.",
    nameColor: "var(--color-dw)",
    taglineColor: "var(--color-dw-tagline)",
  },
  {
    name: "Echo Media",
    tagline: "THE VOICES THAT MAKE DC HOME",
    description:
      "Echo Media is community journalism rooted in the neighborhoods that give DC its character: local profiles, cultural features, and the human stories behind the headlines.",
    nameColor: "var(--color-em)",
    taglineColor: "var(--color-em-tagline)",
  },
  {
    name: "International Spectrum",
    tagline: "DC THROUGH A GLOBAL LENS",
    description:
      "International Spectrum is multicultural coverage reflecting the international DNA of Washington, D.C. Language, food, art, identity: where global meets local.",
    nameColor: "var(--color-is)",
    taglineColor: "var(--color-is-tagline)",
  },
];

const values = [
  {
    name: "Community First",
    description:
      "Every story starts with the people in it. We do not parachute into communities. We are part of them.",
  },
  {
    name: "Amplify, Don\u2019t Extract",
    description:
      "We give people the mic. The voice you hear is theirs, not a repackaged version of it.",
  },
  {
    name: "Bridge Cultures",
    description:
      "DC is the most international city in the country. We cover the connections between communities, not the divisions.",
  },
  {
    name: "Invest in Youth",
    description:
      "The next generation of storytellers is already here. My Hometown, My Lens gives them a stage.",
  },
];


export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Section 1 — Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white">
        <div className="max-w-280 mx-auto px-6 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
            About United Media Group
          </h1>
          <p className="text-xl md:text-2xl font-semibold mb-2 tracking-tight">
            Diplomacy. Culture. Community.
          </p>
          <p className="text-lg md:text-xl text-gray-300">
            Washington, D.C.&apos;s Multicultural Media Voice
          </p>
        </div>
      </section>

      {/* Section 2 — Who We Are */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#3b5fe5] mb-8">
          Who We Are
        </h2>
        <div className="border-l-4 border-[#3b5fe5] pl-6 md:pl-8 space-y-4">
          <p className="text-gray-600 leading-relaxed text-lg">
            United Media Group is Washington DC&apos;s multicultural media
            organization, covering diplomatic affairs, community stories, and
            international perspectives through Diplomatic Watch, Echo Media,
            and International Spectrum. We cover what makes this city unlike
            any other: the diplomatic corridor, the multicultural
            neighborhoods, and the people building bridges between them.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg">
            From embassy row to neighborhood block parties, we give voice to the
            communities, leaders, and changemakers shaping the cultural identity
            of the nation&apos;s capital. The most powerful stories come from the
            people living them, and that belief drives everything we do.
          </p>
        </div>
      </section>

      {/* Section 3 — Our Platforms */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-280 mx-auto px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#3b5fe5] mb-10">
            Our Platforms
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="p-6 bg-white border border-gray-200"
              >
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: platform.nameColor }}
                >
                  {platform.name}
                </h2>
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-4"
                  style={{ color: platform.taglineColor }}
                >
                  {platform.tagline}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {platform.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — My Hometown, My Lens */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#3b5fe5] mb-10">
          My Hometown, My Lens
        </h2>
        <div className="border-3 border-[#3b5fe5] rounded-lg p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#212223] mb-6">
            A National Youth Photography Competition
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-4">
            My Hometown, My Lens invites young photographers ages 10 to 30 to
            show the world their community through their own eyes. No filters.
            No gatekeepers. Just honest, original photography that captures what
            home looks like from the ground up.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg mb-4">
            Winners are exhibited at the{" "}
            <strong className="text-[#212223]">Library of Congress</strong> and
            the{" "}
            <strong className="text-[#212223]">Smithsonian Institution</strong>.
            Over <strong className="text-[#212223]">$8,000 in prizes</strong>{" "}
            awarded across multiple age categories.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg mb-8">
            This is not a contest for professionals. This is a platform for
            young people who have something to say and a camera to say it with.
          </p>
          <Link
            href="/how-to-enter"
            className="text-[#5d5d5d] hover:text-[#212223] font-medium text-lg transition-colors"
          >
            Enter the Competition &rarr;
          </Link>
        </div>
      </section>

      {/* Section 5 — What Drives Us */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-280 mx-auto px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#3b5fe5] mb-10">
            What Drives Us
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value) => (
              <div key={value.name}>
                <h3 className="text-lg font-bold text-[#212223] mb-2">
                  {value.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Our Partners */}
      <HostingCommittees
        title="Our Partners"
        titleClassName="text-2xl md:text-3xl font-bold text-center text-[#3b5fe5] mb-4"
        subtitle="We collaborate with organizations that share our commitment to cultural exchange, education, and community storytelling."
      />

      {/* FAQ — visible content backing the FAQPage schema (AEO ticket 08) */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#3b5fe5] mb-10">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-lg font-bold text-[#212223] mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7 — Connect With Us */}
      <section className="bg-[#212223] text-white">
        <div className="max-w-280 mx-auto px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Connect With Us
          </h2>
          <p className="text-gray-300 leading-relaxed mb-8 max-w-3xl">
            Whether you are a community leader, an embassy representative, a
            young photographer, or someone who believes DC&apos;s multicultural
            identity deserves better coverage, we want to hear from you.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="font-semibold w-28">Email</span>
              <a
                href="mailto:info@unitedmediadc.com"
                className="text-gray-300 hover:text-white transition-colors"
              >
                info@unitedmediadc.com
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold w-28">Instagram</span>
              <a
                href="https://instagram.com/unitedmediagroupdc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                @unitedmediagroupdc
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold w-28">X / Twitter</span>
              <a
                href="https://x.com/unitedmedia_dc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                @unitedmedia_dc
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold w-28">Location</span>
              <span className="text-gray-300">Washington, D.C.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
