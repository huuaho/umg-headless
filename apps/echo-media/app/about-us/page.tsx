export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-280 mx-auto px-6 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[#212223] mb-8">
          About Echo Media
        </h1>

        <div className="max-w-3xl space-y-6 text-base text-gray-700 leading-relaxed">
          <p>
            <strong>Echo Media</strong> is a community-centered media platform
            under United Media. We tell stories that matter — stories rooted in
            lived experience, curiosity, and connection. From neighborhoods and
            creative spaces to online communities and policy conversations, we
            focus on how young people learn, grow, and shape the world around
            them.
          </p>

          <p>
            We believe learning and growth don't happen in one place. They unfold
            in homes, on streets, through culture, and across digital spaces. Our
            work highlights the voices of young people and the communities that
            support them, documenting what they're creating, questioning, and
            changing in real time.
          </p>

          <p>
            Through reporting, interviews, and features, Echo Media captures
            stories often overlooked — moments of struggle, resilience, and
            possibility. We aim to reflect what's happening on the ground,
            centering people over institutions and experience over abstraction.
          </p>

          <h2 className="text-2xl font-bold text-[#212223] pt-4">Mission</h2>
          <p>
            To inform and inspire through honest storytelling that amplifies
            youth voices and community experiences, helping people better
            understand how learning, identity, and opportunity take shape in
            everyday life.
          </p>

          <h2 className="text-2xl font-bold text-[#212223] pt-4">Vision</h2>
          <p>
            A world where young people are heard, communities are valued, and
            stories are used as tools for understanding, dignity, and collective
            growth.
          </p>

          <h2 className="text-2xl font-bold text-[#212223] pt-4">
            Our Core Values
          </h2>
          <ul className="space-y-3">
            <li>
              <strong>Curiosity</strong> — We ask thoughtful questions and follow
              stories with care and intention.
            </li>
            <li>
              <strong>Clarity</strong> — We communicate in ways that are
              accessible, grounded, and human.
            </li>
            <li>
              <strong>Respect</strong> — Every story represents real people. We
              approach our work with empathy and accountability.
            </li>
            <li>
              <strong>Youth-Centered Thinking</strong> — Young people aren't
              waiting to lead — they're already shaping culture and change.
            </li>
            <li>
              <strong>Integrity</strong> — We report responsibly, verify our
              work, and stand behind what we publish.
            </li>
            <li>
              <strong>Access</strong> — Stories should be engaging and
              understandable for everyone, not just insiders.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-[#212223] pt-4">
            Welcome to Echo Media
          </h2>
          <p>
            Echo Media exists to listen closely and share widely. We're building
            a space for storytelling that reflects real communities and real
            voices — especially those of young people navigating and reshaping
            the world today.
          </p>
          <p>
            As part of United Media, we're grounded in a simple belief: stories
            carry power. When we make space for them, we create understanding,
            connection, and possibility.
          </p>
          <p>
            Thanks for being here. Let's listen, learn, and move forward
            together.
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
