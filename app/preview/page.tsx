import Link from "next/link";
import { previewMovies } from "@/lib/data/movies";
import { EmailPreviewCard } from "@/components/email/EmailPreviewCard";

export const metadata = {
  title: "Email Preview · Recon",
  description: "Preview your weekly movie newsletter",
};

export default function PreviewPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
            ← Back to Recon
          </Link>
          <Link href="/dashboard" className="text-sm text-accent hover:text-accent-hover">
            Open dashboard
          </Link>
        </header>
        <article className="overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border">
          <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-3" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-success/80" />
            <span className="ml-3 flex-1 rounded-md bg-card px-3 py-1 text-xs text-muted">mail.recon.app — weekly picks</span>
          </div>
          <div className="bg-white px-6 py-10 sm:px-10 sm:py-12">
            <header className="mb-8 border-b border-zinc-200 pb-8 text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white">R</span>
              <h1 className="mt-4 text-2xl font-bold text-zinc-900 sm:text-3xl">This Week&apos;s Top Picks</h1>
              <p className="mt-2 text-sm text-muted">{today}</p>
              <p className="mx-auto mt-4 max-w-md text-sm text-muted">Curated Netflix films rated 7.0+ on IMDb — hand-picked for your Friday night watch.</p>
            </header>
            <section>
              {previewMovies.map((movie, index) => (
                <EmailPreviewCard key={movie.id} movie={movie} index={index} />
              ))}
            </section>
            <div className="mt-10 rounded-xl bg-zinc-50 p-6 text-center">
              <p className="text-sm text-muted">Want more picks? Visit your dashboard anytime.</p>
              <Link href="/dashboard" className="mt-4 inline-block rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white">View all picks</Link>
            </div>
            <p className="mt-8 text-center text-xs text-muted">You received this because you subscribed to Recon weekly picks.<br /><span className="underline">Unsubscribe</span> · <span className="underline">Manage preferences</span></p>
          </div>
        </article>
      </div>
    </main>
  );
}
