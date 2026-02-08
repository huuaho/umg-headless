export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-[#212223] mb-6">
          About Echo Media
        </h1>
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto leading-relaxed">
          Echo Media focuses on educational content, providing resources and
          stories that inspire learning and personal development. As part of the
          United Media Group network, we are committed to sharing knowledge that
          empowers communities and individuals.
        </p>
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
