import Link from "next/link";

interface CategoryLabelProps {
  category: string;
  slug?: string;
  categoryColor?: string;
  categoryTextColor?: string;
  categoryUnderlineColor?: string;
  categoryIcon?: string;
}

export default function CategoryLabel({
  category,
  slug,
  categoryColor,
  categoryTextColor,
  categoryUnderlineColor,
  categoryIcon,
}: CategoryLabelProps) {
  const textColor = categoryTextColor || categoryColor || "#000";
  const showArrow =
    !categoryUnderlineColor && !categoryIcon && !categoryTextColor;

  const label = (
    <span
      className={`text-sm font-bold ${categoryUnderlineColor ? "border-b-3" : ""}`}
      style={{
        color: textColor,
        ...(categoryUnderlineColor
          ? { borderColor: categoryUnderlineColor }
          : {}),
      }}
    >
      {category}
      {showArrow && " >"}
    </span>
  );

  return (
    <div className="mb-4 flex items-center gap-2">
      {categoryIcon && <img src={categoryIcon} alt="" className="h-4 w-4" />}
      {slug ? (
        <Link
          href={`/category/${slug}`}
          className={
            categoryUnderlineColor
              ? "hover:opacity-70 transition-opacity"
              : "hover:underline"
          }
          style={
            categoryUnderlineColor
              ? undefined
              : { textDecorationColor: textColor }
          }
        >
          {label}
        </Link>
      ) : (
        label
      )}
    </div>
  );
}
