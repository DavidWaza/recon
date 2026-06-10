import { RatingBadge } from "@/components/movie/RatingBadge";
import type { Movie } from "@/lib/types";
import { CTAButton } from "@/components/ui/CTAButton";

type EmailPreviewCardProps = {
  movie: Movie;
  index: number;
};

export function EmailPreviewCard({ movie, index }: EmailPreviewCardProps) {
  return (
    <article className="flex gap-4 border-b border-zinc-200 py-5 last:border-0 last:pb-0 first:pt-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-zinc-900">{movie.title}</h3>
          <RatingBadge rating={movie.imdbRating} size="sm" />
          {movie.watchUrl && (
            <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent ring-1 ring-accent/30">
              Streaming
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
          {movie.description}
        </p>
        <div className="mt-3">
          <a href={movie.watchUrl} target="_blank" rel="noopener noreferrer">
            <CTAButton variant="primary" size="sm" type="button">
              Where to watch
            </CTAButton>
          </a>
        </div>
      </div>
    </article>
  );
}
