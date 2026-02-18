interface CategoryLabelProps {
  category: string;
  categoryColor?: string;
  categoryTextColor?: string;
  categoryUnderlineColor?: string;
  categoryIcon?: string;
}

export default function CategoryLabel({
  category,
  categoryColor,
  categoryTextColor,
  categoryUnderlineColor,
  categoryIcon,
}: CategoryLabelProps) {
  const textColor = categoryTextColor || categoryColor || "#000";
  const showArrow = !categoryUnderlineColor && !categoryIcon && !categoryTextColor;

  return (
    <div className="mb-4 flex items-center gap-2">
      {categoryIcon && <img src={categoryIcon} alt="" className="h-4 w-4" />}
      <span
        className={`text-sm font-bold ${categoryUnderlineColor ? "border-b-3" : ""}`}
        style={{
          color: textColor,
          ...(categoryUnderlineColor ? { borderColor: categoryUnderlineColor } : {}),
        }}
      >
        {category}
        {showArrow && " >"}
      </span>
    </div>
  );
}
