"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export interface NavCategory {
  name: string;
  slug: string;
}

export interface BannerCompany {
  name: string;
  url: string;
  logo: string;
  logoBW: string;
}

export interface HeaderProps {
  logoUrl: string;
  logoAlt: string;
  categories: NavCategory[];
  bannerCompanies: BannerCompany[];
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 15 9"
      className={className}
      aria-hidden="true"
    >
      <path d="M14.093.337c-.411-.45-1.028-.45-1.44 0L7.2 6.3 1.749.337c-.411-.45-1.028-.45-1.44 0a1.16 1.16 0 0 0 0 1.576l6.171 6.75c.206.225.515.337.72.337.205 0 .515-.112.72-.338l6.172-6.75a1.16 1.16 0 0 0 0-1.575h.001Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}

export default function Header({
  logoUrl,
  logoAlt,
  categories,
  bannerCompanies,
}: HeaderProps) {
  // Compute category splits for responsive nav
  const mainCategories = categories.slice(0, 2);
  const lgOnlyCategories = categories.slice(2, 4);
  const moreCategories = categories.slice(4);
  const allCategories = categories;

  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isSearchPage = pathname === "/search";

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Scroll to top on route change, or to hash target if present
  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      const slug = window.location.hash.slice(1);
      const element = document.getElementById(slug);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    // If we're on the homepage, handle smooth scroll manually
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(slug);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    // If on another page, let the Link navigate to /#slug normally
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
    }
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      closeMobileMenu();
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-300">
      <div className="max-w-325 mx-auto px-6">
        <div className="flex items-center h-14">
          {/* Mobile: Left spacer to balance hamburger button for centering logo */}
          <div className="w-8 md:hidden" />

          {/* Logo - centered on mobile, left-aligned on desktop */}
          <div className="shrink-0 md:shrink flex-1 md:flex-none flex justify-center md:justify-start">
            <Link
              href="/"
              className="block hover:opacity-80 transition-opacity"
            >
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop: Search Expanded State (hidden on search page) */}
          {searchOpen && !isSearchPage && (
            <div className="hidden md:flex flex-1 items-center justify-end">
              <form
                onSubmit={handleSearchSubmit}
                className="w-1/2 flex items-center"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 h-10 px-4 border border-gray-300 text-[#212223] placeholder-[#5d5d5d] focus:outline-none focus:border-[#404040]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-[#8b8b8b] hover:bg-[#6b6b6b] transition-colors"
                  aria-label="Submit search"
                >
                  <SearchIcon className="w-5 h-5 text-white" />
                </button>
              </form>
              <button
                onClick={closeSearch}
                className="ml-4 p-2 text-[#404040] hover:text-[#212223] transition-colors"
                aria-label="Close search"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Desktop: Main Navigation - centered (hidden when search is open) */}
          {!searchOpen && (
            <nav className="hidden md:flex flex-1 justify-center items-center space-x-1">
              {mainCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/#${category.slug}`}
                  scroll={false}
                  onClick={(e) => scrollToSection(e, category.slug)}
                  className="px-3 py-2 text-sm font-medium text-[#404040] hover:text-[#212223] transition-colors text-center"
                >
                  {category.name}
                </Link>
              ))}

              {/* Categories only visible on lg+ */}
              {lgOnlyCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/#${category.slug}`}
                  scroll={false}
                  onClick={(e) => scrollToSection(e, category.slug)}
                  className="hidden lg:block px-3 py-2 text-sm font-medium text-[#404040] hover:text-[#212223] transition-colors text-center"
                >
                  {category.name}
                </Link>
              ))}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-[#404040] hover:text-[#212223] transition-colors"
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                >
                  More
                  <ChevronDown
                    className={`ml-1 w-3 h-3 transition-transform ${
                      moreOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {moreOpen && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-300 shadow-lg py-2 z-50">
                    {/* LG-only categories - shown in dropdown below lg */}
                    {lgOnlyCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/#${category.slug}`}
                        scroll={false}
                        onClick={(e) => scrollToSection(e, category.slug)}
                        className="block lg:hidden px-4 py-2 text-sm text-[#5d5d5d] hover:text-[#212223] hover:bg-[#f5f5f5] transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                    {moreCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/#${category.slug}`}
                        scroll={false}
                        onClick={(e) => scrollToSection(e, category.slug)}
                        className="block px-4 py-2 text-sm text-[#5d5d5d] hover:text-[#212223] hover:bg-[#f5f5f5] transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Desktop: Right side - Search icon (hidden when search is open or on search page) */}
          {!searchOpen && !isSearchPage && (
            <div className="hidden md:flex items-center justify-end w-35">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-[#404040] hover:text-[#212223] transition-colors"
                aria-label="Open search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
          )}


          {/* Mobile: Hamburger/Close menu button - always visible on mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 text-[#404040] hover:text-[#212223] transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <CloseIcon className="w-6 h-6" />
            ) : (
              <HamburgerIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Banner - Below main header */}
      <div className="border-t border-gray-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="h-10 flex items-center">
            <div className="animate-marquee flex shrink-0 items-center">
              {/* Repeat 4x for seamless loop */}
              {[...Array(4)].map((_, repeatIndex) =>
                bannerCompanies.map((company, index) => (
                  <a
                    key={`${repeatIndex}-${index}`}
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity mx-16"
                  >
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-6 w-auto"
                    />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Below Header + Banner */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white md:hidden overflow-y-auto border-t border-gray-300 pt-4" style={{ top: '6rem' }}>
          {/* Mobile Search (hidden on search page) */}
          {!isSearchPage && (
            <div className="px-4 pt-4 pb-8 flex justify-center">
              <form
                onSubmit={handleMobileSearchSubmit}
                className="flex"
                style={{ width: "75%" }}
              >
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 h-10 px-4 border border-gray-300 text-[#212223] placeholder-[#5d5d5d] focus:outline-none focus:border-[#404040]"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-[#8b8b8b] hover:bg-[#6b6b6b] transition-colors"
                  aria-label="Submit search"
                >
                  <SearchIcon className="w-5 h-5 text-white" />
                </button>
              </form>
            </div>
          )}

          {/* Categories Header */}
          <div className={`px-4 pb-3 ${isSearchPage ? "pt-0" : "pt-8 border-t border-gray-300"}`}>
            <h2 className="text-xs font-bold text-[#404040] uppercase tracking-wider">
              Categories
            </h2>
          </div>

          {/* Mobile Navigation Links - Two Columns */}
          <nav className="px-4 grid grid-cols-2 gap-x-4">
            {allCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/#${category.slug}`}
                scroll={false}
                onClick={(e) => {
                  scrollToSection(e, category.slug);
                  closeMobileMenu();
                }}
                className="block py-3 text-sm font-medium text-[#404040] hover:text-[#212223] transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* About Us Link */}
          <div className="px-4 pt-6 pb-4 border-t border-gray-300 mt-4">
            <Link
              href="/about-us"
              onClick={closeMobileMenu}
              className="block text-sm font-medium text-[#404040] hover:text-[#212223] transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
