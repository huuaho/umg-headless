"use client";

import Link from "next/link";

interface ArticleLinkProps {
  slug?: string;
  url: string;
  className?: string;
  children: React.ReactNode;
}

export default function ArticleLink({
  slug,
  url,
  className,
  children,
}: ArticleLinkProps) {
  if (slug) {
    return (
      <Link href={`/articles/${slug}`} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
