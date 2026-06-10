import Link from "next/link";

export const metadata = {
  title: "Thanks for the feedback · Recon",
};

const COPY: Record<string, { title: string; body: string }> = {
  up: {
    title: "Noted — more like this 👍",
    body: "Thanks! We'll use this to sharpen next Friday's picks for you.",
  },
  down: {
    title: "Got it — we'll steer clear 👎",
    body: "Thanks for the honesty. We'll learn from this and dial in your taste.",
  },
  saved: {
    title: "Saved for later 🔖",
    body: "Nice pick. We'll keep tuning your recommendations around what you save.",
  },
};

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  const { a } = await searchParams;
  const copy = COPY[a ?? ""] ?? {
    title: "Thanks for the feedback",
    body: "Every tap teaches Recon a little more about what you love.",
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{copy.body}</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-colors hover:bg-accent-hover"
        >
          Back to Recon
        </Link>
      </div>
    </main>
  );
}
