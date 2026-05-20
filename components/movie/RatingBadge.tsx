type RatingBadgeProps = {
  rating: number;
  size?: "sm" | "md";
};

export function RatingBadge({ rating, size = "md" }: RatingBadgeProps) {
  const isHighlight = rating >= 7.0;
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={[
        "inline-flex items-center rounded-lg font-semibold tabular-nums",
        sizeClasses,
        isHighlight
          ? "bg-success/15 text-success ring-1 ring-success/30"
          : "bg-card text-muted ring-1 ring-border",
      ].join(" ")}
    >
      <svg
        className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  );
}
