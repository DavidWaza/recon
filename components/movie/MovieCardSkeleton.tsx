export function MovieCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border"
      aria-hidden
    >
      <div className="aspect-[2/3] animate-pulse bg-border/50" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded-md bg-border" />
        <div className="flex gap-2">
          <div className="h-5 w-14 animate-pulse rounded-md bg-border/70" />
          <div className="h-5 w-16 animate-pulse rounded-md bg-border/70" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-border/70" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-border/70" />
        </div>
        <div className="mt-2 h-9 animate-pulse rounded-xl bg-border/70" />
      </div>
    </div>
  );
}
