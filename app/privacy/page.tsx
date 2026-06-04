import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy — Recon",
  description:
    "Learn how Recon collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="Recon"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-sm font-bold text-white">Recon</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted transition-colors hover:text-white"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
            Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted">Last updated: June 4, 2026</p>
        </div>

        <div className="prose-policy space-y-10 text-[15px] leading-relaxed text-muted/90">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              1. Information We Collect
            </h2>
            <p>
              When you subscribe to Recon, we collect only the information
              necessary to provide our service:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1 text-muted/80">
              <li>
                <strong className="text-white/80">Email address</strong> — Used
                exclusively to deliver your weekly movie recommendations.
              </li>
              <li>
                <strong className="text-white/80">
                  Subscription timestamp
                </strong>{" "}
                — The date and time you subscribed.
              </li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-white/80">not</strong> collect
              names, payment information, browsing history, location data, or
              any other personal information.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              2. How We Use Your Information
            </h2>
            <p>Your email address is used solely for the following purposes:</p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1 text-muted/80">
              <li>
                Sending you weekly curated Netflix movie recommendations (every
                Friday).
              </li>
              <li>Sending a one-time welcome email upon subscription.</li>
              <li>Communicating critical service updates (extremely rare).</li>
            </ul>
            <p className="mt-3">
              We will never use your email for marketing, promotions, or any
              purpose unrelated to the Recon newsletter.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              3. Data Sharing
            </h2>
            <p>
              We do not sell, rent, trade, or share your personal information
              with any third parties. Your email address stays with us and is
              used exclusively for delivering the Recon newsletter.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              4. Data Storage & Security
            </h2>
            <p>
              Your data is stored securely using industry-standard encryption
              and security practices. We use Supabase as our database provider,
              which employs row-level security and encrypted connections. All
              data transmission between your browser and our servers is
              encrypted via HTTPS/TLS.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              5. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1 text-muted/80">
              <li>
                <strong className="text-white/80">Unsubscribe</strong> at any
                time using the one-click unsubscribe link in every email.
              </li>
              <li>
                <strong className="text-white/80">Request data deletion</strong>{" "}
                — Contact us to have your data permanently removed.
              </li>
              <li>
                <strong className="text-white/80">Request data access</strong> —
                Ask us what data we hold about you.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              6. Cookies
            </h2>
            <p>
              Recon does not use tracking cookies, analytics scripts, or any
              form of user tracking on this website. We do not use Google
              Analytics, Facebook Pixel, or any similar services.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              7. Third-Party Services
            </h2>
            <p>We use the following third-party services to operate Recon:</p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1 text-muted/80">
              <li>
                <strong className="text-white/80">Supabase</strong> — Database
                hosting and data storage.
              </li>
              <li>
                <strong className="text-white/80">Resend</strong> — Email
                delivery service.
              </li>
              <li>
                <strong className="text-white/80">Vercel</strong> — Website
                hosting.
              </li>
            </ul>
            <p className="mt-3">
              These services process data only as required to operate our
              service and are bound by their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              8. Children&apos;s Privacy
            </h2>
            <p>
              Recon is not directed to children under 13 years of age. We do not
              knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be reflected on this page with an updated &quot;Last
              updated&quot; date. We encourage you to review this policy
              periodically.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              10. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or your
              personal data, please contact us at:
            </p>
            <p className="mt-3">
              <a
                href="mailto:moviereconn@gmail.com"
                className="font-medium text-accent transition-colors hover:text-accent-hover"
              >
                moviereconn@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-muted/60">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="text-white/10">·</span>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
            <span className="text-white/10">·</span>
            <span>© {new Date().getFullYear()} Recon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
