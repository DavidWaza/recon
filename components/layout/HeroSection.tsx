"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import type { Movie } from "@/lib/types";
import { CTAButton } from "@/components/ui/CTAButton";
import { RatingBadge } from "@/components/movie/RatingBadge";
import { GenreTag } from "@/components/movie/GenreTag";
import { subscribeUser } from "@/services/subscribe";
import axios from "axios";
import { WaitlistForm } from "../email/WaitlistForm";

const SLIDE_INTERVAL_MS = 6000;

function heroImage(movie: Movie) {
  return movie.backdrop ?? movie.poster;
}

function HeroBackdropImage({
  movie,
  priority,
  className,
}: {
  movie: Movie;
  priority?: boolean;
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
      priority={priority}
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
  submitted: boolean;
};

export function HeroSection({
  previewMovies,
  email,
  onEmailChange,
  onSubmit,
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
      await subscribeUser(email);
      toast.success("Subscribed! Check your email for updates.");
      onSubmit(e);
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
      className="relative min-h-[92vh] overflow-hidden pt-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Full-bleed rotating backdrop — stacked slides for reliable crossfade */}
      <div className="absolute inset-0">
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
              priority={i === 0}
              className="object-cover object-[center_20%]"
            />
          </motion.div>
        ))}
      </div>

      {/* Cinematic dark overlays */}
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-black from-0% via-black/92 via-45% to-black/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black via-black/50 via-35% to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-black/20"
        aria-hidden
      />

      {/* Content — left-aligned like StreamVid Home 7 */}
      <div className="relative z-10 mx-auto flex min-h-[calc(92vh-4rem)] mt-10 max-w-7xl flex-col justify-end px-6 pb-28 pt-8 lg:justify-center lg:pb-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-white ring-1 ring-accent/20 shadow-sm"
            >
              New picks every Friday
            </motion.p>
            <div className="flex items-center gap-3 text-sm font-medium text-muted my-5 uppercase">
              <p>Only on</p>
              <Image
                src="/netflix-logo.png"
                alt="Netflix logo"
                width={80}
                height={24}
                className="object-contain"
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeMovie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45 }}
              >
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {activeMovie.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <RatingBadge rating={activeMovie.imdbRating} />
                  {activeMovie.year && (
                    <span className="rounded-md bg-card px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-border">
                      {activeMovie.year}
                    </span>
                  )}
                  {activeMovie.netflixAvailable && (
                    <span className="rounded-md bg-[#E50914] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Netflix
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {activeMovie.genre.map((g) => (
                    <GenreTag key={g} genre={g} />
                  ))}
                </div>

                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted line-clamp-3 sm:text-lg">
                  {activeMovie.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={activeMovie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CTAButton size="md">Watch Trailer</CTAButton>
                  </a>
                  <Link href="#">
                    <CTAButton variant="secondary" size="md" type="button">
                      More info
                    </CTAButton>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Newsletter CTA */}
            {/* <div className="mt-10 border-t border-border pt-8">
              <p className="text-lg font-semibold text-white sm:text-xl">
                Discover high-rated movies every Friday
              </p>
              <p className="mt-1 text-sm text-muted">
                Curated Netflix picks rated on IMDb — free weekly newsletter.
              </p>
              <p className="mt-1 text-xs italic text-muted/80">
                Disclaimer: Available for Netflix users only.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-5 flex w-full max-w-3xl flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="you@email.com"
                  disabled={loading}
                  className="flex-1 rounded-full border border-border bg-black/40 px-4 py-3.5 text-white placeholder:text-muted backdrop-blur-md focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <CTAButton type="submit" size="md" loading={loading}>
                  Get Weekly Picks
                </CTAButton>
              </form>

              {submitted && (
                <p className="mt-3 text-sm text-success">
                  You&apos;re on the list! Check your inbox this Friday.
                </p>
              )}
            </div> */}

            {/* Join the Waitlist */}
            <div className="mt-10 border-t border-border pt-8 space-y-3.5">
              <p className="text-lg font-semibold text-white sm:text-xl">
                Join the waitlist for Recon
              </p>
              <p className="mt-1 text-sm text-muted">
                Get early access to personalized movie recommendations and more.
              </p>
              <WaitlistForm />
            </div>
          </div>
          {/* Poster thumbnail picker (right on desktop) */}
          {slideCount > 1 && (
            <div className="hidden flex-col gap-2 lg:flex">
              {previewMovies.map((movie, i) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${movie.title}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  className={[
                    "group relative h-[72px] w-[48px] overflow-hidden rounded-lg ring-2 transition-all duration-300",
                    i === activeIndex
                      ? "ring-accent scale-105 shadow-lg shadow-accent/30"
                      : "ring-border/80 opacity-60 hover:opacity-100 hover:ring-border",
                  ].join(" ")}
                >
                  <HeroPosterThumb
                    movie={movie}
                    alt={movie.title}
                    sizes="48px"
                  />
                  {i === activeIndex && (
                    <span className="absolute inset-0 bg-accent/10" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile / bottom slide indicators */}
        {slideCount > 1 && (
          <motion.div className="mt-8 flex items-center justify-between gap-4 lg:mt-10">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {previewMovies.map((movie, i) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${movie.title}`}
                  className={[
                    "relative h-16 w-11 shrink-0 overflow-hidden rounded-md ring-2 transition-all",
                    i === activeIndex
                      ? "ring-accent"
                      : "ring-border/80 opacity-70",
                  ].join(" ")}
                >
                  <HeroPosterThumb movie={movie} alt="" sizes="44px" />
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Previous slide"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-white ring-1 ring-border transition hover:bg-border"
              >
                <ChevronLeftIcon />
              </button>
              <div className="flex gap-1.5">
                {previewMovies.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={[
                      "h-1.5 rounded-full transition-all duration-300",
                      i === activeIndex
                        ? "w-8 bg-accent"
                        : "w-1.5 bg-border hover:bg-border",
                    ].join(" ")}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-white ring-1 ring-border transition hover:bg-border"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function HeroPreviewSection({ movies }: { movies: Movie[] }) {
  return (
    <motion.section
      className="relative overflow-hidden border-t border-border bg-background/80 py-24"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute left-1/2 top-0 h-[280px] w-[320px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-accent">
            Featured picks
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            This week's preview
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            A premium sneak peek of the Netflix movies that land in your inbox
            every Friday.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {movies.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-0 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_90px_-35px_rgba(79,70,229,0.35)]"
            >
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-accent/20 via-transparent to-white/10 opacity-80" />
              <div className="relative overflow-hidden rounded-[2rem] bg-card">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
                    {movie.year}
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {movie.title}
                    </h3>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-accent ring-1 ring-accent/20">
                      {movie.imdbRating}
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-muted line-clamp-3">
                    {movie.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {movie.genre.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-muted ring-1 ring-white/10"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
