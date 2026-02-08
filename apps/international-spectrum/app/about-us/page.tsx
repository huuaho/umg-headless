export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[#212223] mb-8">
          About International Spectrum
        </h1>

        <div className="max-w-3xl space-y-6 text-base text-gray-700 leading-relaxed">
          <p className="font-semibold">
            International Spectrum is a culture and lifestyle media platform
            under United Media, dedicated to curating and telling stories that
            reflect the richness, nuance, and diversity of how people live,
            create, and connect across the world.
          </p>

          <p className="font-semibold">
            We go beyond trends and travel guides. Our work explores cultural
            identities, global aesthetics, everyday rituals, and the creative
            pulse that defines contemporary living — from local traditions to
            international influences. Through insightful reporting, refined
            storytelling, and compelling visuals, we offer a thoughtful lens into
            the global lifestyle landscape.
          </p>

          <p className="font-semibold">
            At International Spectrum, we believe culture is not a backdrop — it
            is the story. Whether we're covering emerging designers in Dakar,
            culinary heritage in Istanbul, or wellness philosophies in Kyoto, we
            engage with people and places in a way that is immersive, respectful,
            and genuinely curious.
          </p>

          <p className="font-semibold">
            We connect the dots between heritage and modernity, individuality and
            community, craft and innovation — shaping a platform where lifestyle
            journalism meets cultural intelligence.
          </p>
        </div>
      </section>

      <section className="bg-[#212223] text-white">
        <div className="max-w-280 mx-auto px-6 py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-gray-300 mb-6">
            We welcome you to connect with us.
          </p>
          <a
            href="mailto:unitedmediagroup196@gmail.com"
            className="inline-block px-8 py-3 border border-white text-white font-medium hover:bg-white hover:text-[#212223] transition-colors"
          >
            Get In Touch
          </a>
        </div>
      </section>
    </main>
  );
}
