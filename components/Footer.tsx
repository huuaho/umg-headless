import Link from "next/link";
import { leftCategories, rightCategories } from "@/lib/categories";
import { mediaCompanies } from "@/lib/mediaCompanies";

export default function Footer() {
  return (
    <footer className="border-t border-gray-300">
      {/* Row 1: Big Logo */}
      <div className="py-8">
        <div className="max-w-325 mx-auto px-6">
          <div className="flex justify-center">
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="https://api.unitedmediadc.com/wp-content/uploads/2026/01/UMG-Masthead-Black.svg"
                alt="United Media Group"
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
              {mediaCompanies.map((company) => (
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
                href="mailto:unitedmediagroup196@gmail.com"
                className="text-sm text-[#404040] hover:text-[#212223] transition-colors"
              >
                Contact Us
              </a>
              <p className="text-sm text-gray-500 mt-4">
                &copy; 2026 United Media Group
              </p>
              <p className="text-sm text-gray-500">All Rights Reserved</p>
            </div>
          </div>

          {/* Mobile/Tablet Layout (below LG): 3 stacked rows */}
          <div className="lg:hidden space-y-8">
            {/* Row 1: Media logos (centered) */}
            <div className="flex flex-col items-center space-y-4">
              {mediaCompanies.map((company) => (
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
                href="mailto:unitedmediagroup196@gmail.com"
                className="text-sm text-[#404040] hover:text-[#212223] transition-colors"
              >
                Contact Us
              </a>
              <p className="text-sm text-gray-500 mt-2">
                &copy; 2026 United Media Group
              </p>
              <p className="text-sm text-gray-500">All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
