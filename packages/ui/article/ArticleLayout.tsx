import Image from "next/image";

interface ArticleLayoutProps {
  title: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  featuredImage: string | null;
  content: string; // Sanitized HTML (Divi stripped)
}

export default function ArticleLayout({
  title,
  author,
  date,
  category,
  readTime,
  featuredImage,
  content,
}: ArticleLayoutProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-6 py-8">
        {/* Category + Read Time */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span className="font-semibold text-black">{category}</span>
          <span>&middot;</span>
          <span>{readTime}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
          {title}
        </h1>

        {/* Author + Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <span>By {author}</span>
          <span>&middot;</span>
          <time dateTime={date}>{formattedDate}</time>
        </div>

        {/* Featured Image */}
        {featuredImage && (
          <div className="relative w-full aspect-3/2 mb-8 -mx-6 md:mx-0">
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Body */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-700 prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </main>
  );
}
