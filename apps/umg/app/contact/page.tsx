export const metadata = {
  title: "Contact United Media Group",
  description:
    "Contact United Media Group, Washington DC's multicultural media organization — press inquiries, photo competition questions, and community story ideas.",
};

const CONTACT_EMAIL = "info@unitedmediadc.com";

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact United Media Group",
  url: "https://unitedmediadc.com/contact/",
  mainEntity: {
    "@type": "NewsMediaOrganization",
    name: "United Media Group",
    email: CONTACT_EMAIL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Washington",
      addressRegion: "DC",
      addressCountry: "US",
    },
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white">
        <div className="max-w-280 mx-auto px-6 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
            Contact United Media Group
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            We want to hear from you
          </p>
        </div>
      </section>

      {/* Contact details */}
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-600 leading-relaxed text-lg mb-10">
            Whether you are a community leader, an embassy representative, a
            young photographer entering My Hometown, My Lens, or someone who
            believes DC&apos;s multicultural identity deserves better coverage
            — reach out.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-[#212223] w-28">Email</span>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#3b5fe5] hover:text-[#212223] transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-[#212223] w-28">
                Instagram
              </span>
              <a
                href="https://www.instagram.com/unitedmediagroupdc/"
                target="_blank"
                rel="me noopener noreferrer"
                className="text-[#3b5fe5] hover:text-[#212223] transition-colors"
              >
                @unitedmediagroupdc
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-[#212223] w-28">
                X / Twitter
              </span>
              <a
                href="https://x.com/unitedmedia_dc"
                target="_blank"
                rel="me noopener noreferrer"
                className="text-[#3b5fe5] hover:text-[#212223] transition-colors"
              >
                @unitedmedia_dc
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-[#212223] w-28">
                Location
              </span>
              <span className="text-gray-600">Washington, D.C.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
