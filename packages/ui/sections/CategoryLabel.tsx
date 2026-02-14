interface CategoryLabelProps {
  category: string;
  categoryColor?: string;
  categoryIcon?: string;
}

export default function CategoryLabel({
  category,
  categoryColor,
  categoryIcon,
}: CategoryLabelProps) {
  // Enhanced style: icon + black text + colored underline
  if (categoryIcon) {
    return (
      <div className="mb-4 flex items-center gap-2">
        <img src={categoryIcon} alt="" className="h-4 w-4" />
        <span className="text-sm font-bold text-black pb-1 border-b-3" style={categoryColor ? { borderColor: categoryColor } : undefined}>
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
