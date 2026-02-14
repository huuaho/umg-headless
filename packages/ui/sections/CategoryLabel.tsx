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
  // Enhanced style: icon + text + colored underline
  if (categoryIcon) {
    const textColor = categoryTextColor || "#000";
    const underlineColor = categoryUnderlineColor || categoryColor;

    return (
      <div className="mb-4 flex items-center gap-2">
        <img src={categoryIcon} alt="" className="h-4 w-4" />
        <span
          className="text-sm font-bold pb-1 border-b-3"
          style={{ color: textColor, borderColor: underlineColor }}
        >
          {category}
        </span>
      </div>
    );
  }

  // Default style: colored text with arrow
  return (
    <div className="mb-4">
      <span
        className="text-sm font-bold"
        style={categoryColor ? { color: categoryColor } : { color: "#000" }}
      >
        {category} &gt;
      </span>
    </div>
  );
}
