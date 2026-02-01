import { mediaCompanies } from "@/lib/mediaCompanies";

const values = [
  {
    name: "Integrity",
    description: "We maintain high ethical standards.",
  },
  {
    name: "Connection",
    description: "We enhance understanding between people.",
  },
  {
    name: "Empowerment",
    description: "We provide tools for personal growth.",
  },
  {
    name: "Hope",
    description: "We share stories that inspire optimism.",
  },
  {
    name: "Inclusivity",
    description: "We value diverse perspectives.",
  },
];

const contentTypes = [
  "In-depth articles and reports",
  "Educational resources and programs",
  "Cultural documentaries and features",
  "Multimedia content",
  "Youth initiatives",
];

const readershipInterests = [
  "International affairs",
  "Educational development",
  "Cultural exploration",
  "Positive and uplifting stories",
  "Global citizenship",
];

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-325 mx-auto px-6 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-[#212223] mb-6">
          About Us
        </h1>
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto leading-relaxed">
          United Media Group, based in the United States, is a network of media
          companies committed to sharing stories that inspire hope, connection,
          and positive change. We believe media builds bridges between cultures
          and empowers future generations. As an umbrella organization, we
          support and amplify the impact of three distinct media platforms:
          Diplomatic Watch Magazine, Echo Media, and International Spectrum
          Media.
        </p>
      </section>

      {/* Mission & Vision Section */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-325 mx-auto px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#212223] mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed">
                United Media Group creates content that inspires hope, connects
                diverse communities, and empowers youth. We build bridges
                between cultures through shared stories and provide resources
                that enable young people to thrive. We unite media platforms to
                amplify positive narratives and drive global connections. We
                shine a light on the good in the world and equip the next
                generation to shape it.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#212223] mb-4">
                Our Vision
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We envision a world where stories kindle joy, cultures connect,
                and young people build a better future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Network Section */}
      <section className="max-w-325 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
          Our Network of Media Companies
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {mediaCompanies.map((company) => (
            <a
              key={company.name}
              href={company.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-6 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="mb-4 h-[100px] md:h-[120px] flex items-center justify-center">
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="max-h-full w-auto object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-[#212223] mb-3 group-hover:underline text-center">
                {company.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed text-center">
                {company.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Content & Readership Section */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-325 mx-auto px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#212223] mb-4">
                Our Content
              </h2>
              <p className="text-gray-600 mb-4">
                We produce a diverse range of content, including:
              </p>
              <ul className="space-y-2 text-gray-600 mb-4">
                {contentTypes.map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="text-gray-400 mr-2">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-gray-600">
                Our content emphasizes positive stories, educational
                advancement, and cultural appreciation.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#212223] mb-4">
                Our Readership
              </h2>
              <p className="text-gray-600 mb-4">
                We reach a global audience interested in:
              </p>
              <ul className="space-y-2 text-gray-600">
                {readershipInterests.map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="text-gray-400 mr-2">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="max-w-325 mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#212223] mb-10">
          Our Values
        </h2>
        <div className="flex flex-wrap justify-center gap-6 md:gap-4">
          {values.map((value) => (
            <div
              key={value.name}
              className="text-center w-full md:w-[calc(50%-8px)] lg:w-[calc(20%-13px)]"
            >
              <h3 className="font-semibold text-[#212223] mb-2">
                {value.name}
              </h3>
              <p className="text-sm text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partnerships Section */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-325 mx-auto px-6 py-12 md:py-16">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-[#212223] mb-4">
              Our Partnerships
            </h2>
            <p className="text-gray-600 mb-4">
              We collaborate with organizations that share our goals. We seek
              partnerships to:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">&bull;</span>
                Expand our reach
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">&bull;</span>
                Support educational and cultural programs
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">&bull;</span>
                Create youth opportunities
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="max-w-325 mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <h2 className="text-2xl font-bold text-[#212223] mb-4">
              Administrative Leadership
            </h2>
            <p className="text-gray-600 leading-relaxed">
              United Media Group is led by experienced professionals dedicated
              to our mission. We provide strategic guidance to our media
              companies.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#212223] mb-4">
              Editorial Team
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our editorial teams include talented journalists and content
              creators worldwide. We are passionate about impactful
              storytelling.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="bg-[#212223] text-white">
        <div className="max-w-325 mx-auto px-6 py-12 md:py-16 text-center">
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
