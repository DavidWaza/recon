import Link from "next/link";

export const metadata = {
  title: "Unsubscribed · Recon",
};

export default function UnsubscribedPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-card sm:p-10">
        <h1 className="text-2xl font-bold text-foreground">
          You&apos;re unsubscribed
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          You won&apos;t receive any more weekly picks. No hard feelings — if you
          change your mind, you&apos;re always welcome back.
        </p>
        <Link
          href="/#subscribe"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-foreground shadow-glow transition-colors hover:bg-accent-hover"
        >
          Resubscribe
        </Link>
      </div>
    </main>
  );
}
