type GenreTagProps = {
  genre: string;
  size?: "sm" | "md";
};

export function GenreTag({ genre, size = "md" }: GenreTagProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md bg-card text-muted ring-1 ring-border",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
      ].join(" ")}
    >
      {genre}
    </span>
  );
}
