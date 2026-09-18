"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import type { Movie } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { RatingBadge } from "@/components/movie/RatingBadge";
import { GenreTag } from "@/components/movie/GenreTag";
import { subscribeUser } from "@/services/subscribe";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/landing/Section";

const SLIDE_INTERVAL_MS = 6000;

function heroImage(movie: Movie) {
  return movie.backdrop ?? movie.poster;
}

function HeroBackdropImage({
  movie,
  preload,
  className,
}: {
  movie: Movie;
  preload?: boolean;
  className?: string;
}) {
  const [src, setSrc] = useState(heroImage(movie));

  useEffect(() => {
    setSrc(heroImage(movie));
  }, [movie]);

  return (
    <Image
      src={src}
      alt=""
      fill
      preload={preload}
      className={className}
      sizes="100vw"
      onError={() => {
        if (src !== movie.poster) setSrc(movie.poster);
      }}
    />
  );
}

function HeroPosterThumb({
  movie,
  alt,
  sizes,
}: {
  movie: Movie;
  alt: string;
  sizes: string;
}) {
  const [src, setSrc] = useState(movie.poster);

  useEffect(() => {
    setSrc(movie.poster);
  }, [movie.poster]);

  return (
    <Image src={src} alt={alt} fill className="object-cover" sizes={sizes} />
  );
}

type HeroSectionProps = {
  previewMovies: Movie[];
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSubscribed?: (subscriberId: string) => void;
  submitted: boolean;
};

export function HeroSection({
  previewMovies,
  email,
  onEmailChange,
  onSubmit,
  onSubscribed,
  submitted,
}: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const activeMovie = previewMovies[activeIndex] ?? previewMovies[0];
  const slideCount = previewMovies.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoading(false);
      setSubmitError("Please enter a valid email address");
      return;
    }

    try {
      const res = await subscribeUser(email);
      toast.success("Subscribed! Check your email for updates.");
      onSubmit(e);
      const subscriberId = res?.data?.id;
      if (subscriberId) onSubscribed?.(subscriberId);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Something went wrong")
        : "Something went wrong";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goTo = useCallback(
    (index: number) => {
      if (slideCount === 0) return;
      setActiveIndex(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    const timer = setInterval(next, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slideCount, isPaused, next]);

  if (!activeMovie) return null;

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Rotating backdrop — stacked slides for a reliable crossfade. On phones
          it's a banner behind the top of the content, not the full section. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] sm:h-full">
        {previewMovies.map((movie, i) => (
          <motion.div
            key={movie.id}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: i === activeIndex ? 1 : 0,
              scale: i === activeIndex ? 1 : 1.05,
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            aria-hidden={i !== activeIndex}
          >
            <HeroBackdropImage
              movie={movie}
              preload={i === 0}
              className="object-cover object-[center_20%]"
            />
          </motion.div>
        ))}
        {/* Cinematic overlays */}
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-base-0 via-base-0/70 to-base-0/20 sm:bg-linear-to-r sm:from-base-0 sm:via-base-0/85 sm:to-base-0/10" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-base-0 via-transparent to-transparent" />
      </div>

      <div className="mx-auto flex min-h-svh max-w-7xl flex-col justify-end px-4 pb-10 pt-[calc(6rem+env(safe-area-inset-top))] sm:px-6 sm:pb-16 lg:justify-center lg:pb-20 lg:pt-28">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
          <div className="min-w-0 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex flex-wrap items-center gap-2"
            >
              <span className="inline-flex h-7 items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/15 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur-md">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-500 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-accent-500" />
                </span>
                New picks every Friday
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                Across every streaming service
              </span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeMovie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45 }}
              >
                <h1 className="text-balance text-[2.5rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {activeMovie.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <RatingBadge rating={activeMovie.imdbRating} />
                  {activeMovie.year && (
                    <span className="inline-flex h-6 items-center rounded-md border border-border bg-surface/70 px-2.5 text-xs font-medium text-muted">
                      {activeMovie.year}
                    </span>
                  )}
                  {activeMovie.genre.slice(0, 3).map((g) => (
                    <GenreTag key={g} genre={g} />
                  ))}
                </div>

                <p className="mt-4 line-clamp-3 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg">
                  {activeMovie.description}
                </p>

                {(activeMovie.trailerUrl || activeMovie.watchUrl) && (
                  <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                    {activeMovie.trailerUrl && (
                      <ButtonLink href={activeMovie.trailerUrl} external color="neutral" className="sm:w-auto">
                        <Icon name="play" />
                        Trailer
                      </ButtonLink>
                    )}
                    {activeMovie.watchUrl && (
                      <ButtonLink
                        href={activeMovie.watchUrl}
                        external
                        color="neutral"
                        variant="soft"
                        className="sm:w-auto"
                      >
                        Where to watch
                        <Icon name="arrow-up-right" />
                      </ButtonLink>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Slide rail — phones & tablets */}
            {slideCount > 1 && (
              <div className="mt-6 flex items-center gap-3 lg:hidden">
                <div className="no-scrollbar -mx-1 flex flex-1 gap-2 overflow-x-auto px-1 py-1">
                  {previewMovies.map((movie, i) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Show ${movie.title}`}
                      aria-current={i === activeIndex ? "true" : undefined}
                      className={cn(
                        "relative h-16 w-11 shrink-0 overflow-hidden rounded-lg ring-2 transition-all",
                        i === activeIndex ? "ring-accent-500" : "opacity-60 ring-transparent",
                      )}
                    >
                      <HeroPosterThumb movie={movie} alt="" sizes="44px" />
                    </button>
                  ))}
                </div>
                <SlideArrows onPrev={() => goTo(activeIndex - 1)} onNext={next} />
              </div>
            )}

            {/* Newsletter CTA */}
            <div
              id="subscribe"
              className="mt-8 scroll-mt-24 rounded-3xl border border-border bg-base-0/70 p-5 shadow-pop backdrop-blur-xl sm:p-6"
            >
              <p className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Discover high-rated movies every Friday
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Curated picks rated on IMDb, with where to stream each one — free
                weekly newsletter across Netflix, Prime Video, Max, Apple TV+ and more.
              </p>

              {submitted ? (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-150 bg-green-50 px-4 py-3.5 text-sm text-foreground">
                  <Icon name="check-circle" className="text-green-500" />
                  You&apos;re on the list! Check your inbox this Friday.
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                  <label htmlFor="hero-email" className="sr-only">
                    Email address
                  </label>
                  <Input
                    id="hero-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    size="lg"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="you@email.com"
                    disabled={loading}
                    aria-invalid={submitError ? true : undefined}
                    aria-describedby={submitError ? "hero-email-error" : undefined}
                    className="rounded-full bg-base-100/80 px-5"
                  />
                  <Button type="submit" size="lg" loading={loading} className="sm:w-auto" block>
                    Get weekly picks
                    {!loading && <Icon name="arrow-right" />}
                  </Button>
                </form>
              )}
              {submitError && !submitted && (
                <p id="hero-email-error" role="alert" className="mt-2.5 px-2 text-sm text-red-500">
                  {submitError}
                </p>
              )}
              <p className="mt-3 flex items-center gap-1.5 px-1 text-xs text-subtle">
                <Icon name="shield" className="size-3.5" />
                One email a week. Unsubscribe in one click.
              </p>
            </div>
          </div>

          {/* Poster picker — desktop rail */}
          {slideCount > 1 && (
            <div className="hidden flex-col items-center gap-2.5 lg:flex">
              {previewMovies.map((movie, i) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${movie.title}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  className={cn(
                    "relative h-21 w-14 overflow-hidden rounded-xl ring-2 transition-all duration-300",
                    i === activeIndex
                      ? "scale-105 shadow-glow ring-accent-500"
                      : "opacity-50 ring-base-950/10 hover:opacity-100",
                  )}
                >
                  <HeroPosterThumb movie={movie} alt={movie.title} sizes="56px" />
                </button>
              ))}
              <div className="mt-2">
                <SlideArrows onPrev={() => goTo(activeIndex - 1)} onNext={next} vertical />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SlideArrows({
  onPrev,
  onNext,
  vertical = false,
}: {
  onPrev: () => void;
  onNext: () => void;
  vertical?: boolean;
}) {
  return (
    <div className={cn("flex shrink-0 gap-2", vertical && "flex-col")}>
      <Button color="neutral" variant="soft" size="icon-sm" onClick={onPrev} aria-label="Previous slide">
        <Icon name={vertical ? "chevron-down" : "chevron-left"} className={cn(vertical && "rotate-180")} />
      </Button>
      <Button color="neutral" variant="soft" size="icon-sm" onClick={onNext} aria-label="Next slide">
        <Icon name={vertical ? "chevron-down" : "chevron-right"} />
      </Button>
    </div>
  );
}

export function HeroPreviewSection({ movies }: { movies: Movie[] }) {
  return (
    <section className="relative overflow-hidden border-t border-border py-16 sm:py-24">
      <div aria-hidden className="absolute left-1/2 top-0 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-accent-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Featured picks"
          title="This week's preview"
          lead="A sneak peek of the movies landing in your inbox this Friday — with where to stream every one."
        />

        {/* Phones: a swipeable snap rail. md+: a grid. */}
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-3">
          {movies.map((movie, i) => (
            <motion.article
              key={movie.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
              className="group relative flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card transition-[border-color,transform] duration-300 xs:w-[20rem] md:w-auto md:hover:-translate-y-1 md:hover:border-accent-500/40"
            >
              <div className="relative aspect-16/10 overflow-hidden">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 82vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/10 to-transparent" />
                <div className="absolute left-3 top-3">
                  <RatingBadge rating={movie.imdbRating} />
                </div>
                {movie.year && (
                  <span className="absolute right-3 top-3 rounded-full bg-base-0/60 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-foreground backdrop-blur-sm">
                    {movie.year}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-foreground">
                  {movie.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                  {movie.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {movie.genre.slice(0, 3).map((genre) => (
                    <GenreTag key={genre} genre={genre} size="sm" />
                  ))}
                </div>

                {(movie.trailerUrl || movie.watchUrl) && (
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                    {movie.trailerUrl && (
                      <ButtonLink
                        href={movie.trailerUrl}
                        external
                        color="secondary"
                        size="sm"
                        block
                        className={cn("h-10", !movie.watchUrl && "col-span-2")}
                      >
                        <Icon name="play" />
                        Trailer
                      </ButtonLink>
                    )}
                    {movie.watchUrl && (
                      <ButtonLink
                        href={movie.watchUrl}
                        external
                        size="sm"
                        block
                        className={cn("h-10", !movie.trailerUrl && "col-span-2")}
                      >
                        Watch
                        <Icon name="arrow-up-right" />
                      </ButtonLink>
                    )}
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
