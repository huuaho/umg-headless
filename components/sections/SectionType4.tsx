import Image from "next/image";
import type { SectionType4Data, Type4Article } from "@/lib/dummyData";

function ArticleCard({
  article,
  textOnly,
  index,
}: {
  article: Type4Article;
  textOnly: boolean;
  index: number;
}) {
  // SM: All except last (index 3) have bottom borders
  // MD: Only top row (indexes 0, 1) have bottom borders
  // LG: No individual article borders
  const isTopRow = index < 2;

  // Column padding logic (on outer wrapper so border doesn't extend into padding):
  // MD: 2 columns - left gets pr-4, right gets pl-4
  // LG: 4 columns - first gets nothing, middle two get px-4, last gets nothing
  const getPaddingClasses = () => {
    if (index === 0) return "md:pr-4 lg:pr-4";
    if (index === 1) return "md:pl-4 lg:px-4";
    if (index === 2) return "md:pr-4 lg:px-4";
    return "md:pl-4 lg:pl-4";
  };

  // Border logic (on inner wrapper)
  const getBorderClasses = () => {
    // SM: All except last have bottom border
    // MD: Only top row has bottom border
    // LG: No borders
    let classes = "border-gray-300";
    if (index < 3) classes += " border-b";
    if (!isTopRow) classes += " md:border-b-0";
    classes += " lg:border-b-0";
    return classes;
  };

  return (
    <div className={`${getPaddingClasses()} md:h-full`}>
      <article
        className={`py-3 md:h-full ${getBorderClasses()} ${
          !textOnly ? "flex gap-4 lg:flex-col lg:gap-2" : ""
        }`}
      >
        {/* Image - 1/3 width on SM/MD, full width on top at LG */}
        {!textOnly && article.image && (
          <div className="w-1/3 lg:w-full order-2 lg:order-1">
            <div className="relative aspect-3/2">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Text content - 2/3 width on SM/MD, full width below image at LG */}
        <div className={!textOnly ? "w-2/3 lg:w-full order-1 lg:order-2" : ""}>
          <h3 className="font-semibold text-base leading-tight mb-1">
            {article.title}
          </h3>
          <span className="text-sm text-gray-500">{article.time}</span>
        </div>
      </article>
    </div>
  );
}

interface SectionType4Props extends SectionType4Data {
  slug: string;
  category: string;
  textOnly?: boolean;
}

export default function SectionType4({
  slug,
  category,
  articles,
  textOnly = false,
}: SectionType4Props) {
  return (
    <section
      id={slug}
      className="pt-6 pb-6 scroll-mt-24 border-b border-gray-300"
    >
      {/* Category Label */}
      <div className="mb-4">
        <a
          href="#"
          className="text-sm font-bold text-black hover:text-gray-700"
        >
          {category} &gt;
        </a>
      </div>

      {/* Articles - SM: stacked, MD: 2x2 grid, LG: 4 columns */}
      <div className="md:grid md:grid-cols-2 lg:grid-cols-4">
        {articles.map((article, index) => (
          <ArticleCard
            key={index}
            article={article}
            textOnly={textOnly}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
