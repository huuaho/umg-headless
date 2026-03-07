import Link from "next/link";
import type { NavCategory, BannerCompany } from "./Header";

export interface FooterProps {
  logoUrl: string;
  logoAlt: string;
  categories: NavCategory[];
  companies: BannerCompany[];
  email: string;
  copyright: string;
  socials?: { platform: string; url: string }[];
}

export default function Footer({
  logoUrl,
  logoAlt,
  categories,
  companies,
  email,
  copyright,
  socials,
}: FooterProps) {
  const socialIcons: Record<string, React.ReactNode> = {
    x: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  };

  // Sort categories alphabetically and split into two columns
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const midpoint = Math.ceil(sortedCategories.length / 2);
  const leftCategories = sortedCategories.slice(0, midpoint);
  const rightCategories = sortedCategories.slice(midpoint);

  return (
    <footer className="border-t border-gray-300" style={{ backgroundColor: 'var(--footer-bg, transparent)' }}>
      {/* Row 1: Big Logo */}
      <div className="py-8">
        <div className="max-w-325 mx-auto px-6">
          <div className="flex justify-center">
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-12 w-auto"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Content */}
      <div>
        <div className="max-w-325 mx-auto px-6 py-8">
          {/* Desktop Layout (LG+): 4 columns with dividers */}
          <div className="hidden lg:flex">
            {/* Col 1: Media logos */}
            <div className="flex flex-col space-y-4 pr-8">
              {companies.map((company) => (
                <a
                  key={company.name}
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                >
                  <img
                    src={company.logoBW}
                    alt={company.name}
                    className="h-8 w-auto"
                  />
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="border-l border-gray-300 mx-8" />

            {/* Col 2: Categories left */}
            <div className="flex flex-col space-y-2">
              {leftCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/#${category.slug}`}
                  className="text-sm text-[#404040] hover:text-[#212223] transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Col 3: Categories right */}
            <div className="flex flex-col space-y-2 ml-auto text-right">
              {rightCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/#${category.slug}`}
                  className="text-sm text-[#404040] hover:text-[#212223] transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="border-l border-gray-300 mx-8" />

            {/* Col 4: Meta links */}
            <div className="flex flex-col space-y-2 text-right">
              <Link
                href="/about-us"
                className="text-sm text-[#404040] hover:text-[#212223] transition-colors"
              >
                About Us
              </Link>
              <a
                href={`mailto:${email}`}
                className="text-sm text-[#404040] hover:text-[#212223] transition-colors"
              >
                Contact Us
              </a>
              {socials && socials.length > 0 && (
                <div className="flex justify-end gap-3 mt-2">
                  {socials.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#404040] hover:text-[#212223] transition-colors"
                      aria-label={social.platform}
                    >
                      {socialIcons[social.platform]}
                    </a>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-4">
                {copyright}
              </p>
              <p className="text-sm text-gray-500">All Rights Reserved</p>
            </div>
          </div>

          {/* Mobile/Tablet Layout (below LG): 3 stacked rows */}
          <div className="lg:hidden space-y-8">
            {/* Row 1: Media logos (centered) */}
            <div className="flex flex-col items-center space-y-4">
              {companies.map((company) => (
                <a
                  key={company.name}
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                >
                  <img
                    src={company.logoBW}
                    alt={company.name}
                    className="h-8 w-auto"
                  />
                </a>
              ))}
            </div>

            {/* Row 2: Categories (left/right aligned) */}
            <div className="flex justify-center gap-24 md:gap-40">
              <div className="flex flex-col space-y-2">
                {leftCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/#${category.slug}`}
                    className="text-sm text-[#404040] hover:text-[#212223] transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col space-y-2 text-right">
                {rightCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/#${category.slug}`}
                    className="text-sm text-[#404040] hover:text-[#212223] transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Row 3: Meta links (centered) */}
            <div className="flex flex-col items-center space-y-2">
              <Link
                href="/about-us"
                className="text-sm text-[#404040] hover:text-[#212223] transition-colors"
              >
                About Us
              </Link>
              <a
                href={`mailto:${email}`}
                className="text-sm text-[#404040] hover:text-[#212223] transition-colors"
              >
                Contact Us
              </a>
              {socials && socials.length > 0 && (
                <div className="flex justify-center gap-3 mt-2">
                  {socials.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#404040] hover:text-[#212223] transition-colors"
                      aria-label={social.platform}
                    >
                      {socialIcons[social.platform]}
                    </a>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {copyright}
              </p>
              <p className="text-sm text-gray-500">All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
