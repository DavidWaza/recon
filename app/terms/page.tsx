import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service — Recon",
  description:
    "Terms and conditions for using the Recon weekly movie recommendation newsletter.",
};

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-muted">Last updated: June 4, 2026</p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-muted/90">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By subscribing to or using Recon (&quot;the Service&quot;), you
              agree to be bound by these Terms of Service. If you do not agree
              with any part of these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              2. Description of Service
            </h2>
            <p>
              Recon is a free weekly newsletter service that delivers curated
              Netflix movie recommendations based on IMDb ratings. The Service
              includes:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1 text-muted/80">
              <li>
                Weekly email newsletters with movie recommendations (delivered
                every Friday).
              </li>
              <li>
                A public website (getrecon.app) showcasing current and past
                recommendations.
              </li>
              <li>
                Direct links to movie trailers and Netflix streaming pages.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              3. User Obligations
            </h2>
            <p>By using the Service, you agree to:</p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1 text-muted/80">
              <li>Provide a valid email address for subscription.</li>
              <li>Not use the Service for any unlawful purpose.</li>
              <li>
                Not attempt to access, tamper with, or use unauthorized areas of
                the Service.
              </li>
              <li>
                Not redistribute the content of our newsletters without
                permission.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              4. Intellectual Property
            </h2>
            <p>
              The content, curation, design, and branding of Recon are the
              intellectual property of Recon and its creators. Movie posters,
              trailers, and related media are the property of their respective
              copyright holders and are used for informational and
              recommendation purposes only.
            </p>
            <p className="mt-3">
              Recon is not affiliated with, endorsed by, or sponsored by
              Netflix, IMDb, or any movie studio. All trademarks belong to their
              respective owners.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              5. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided on an &quot;as-is&quot; and
              &quot;as-available&quot; basis without warranties of any kind,
              either express or implied. We do not guarantee:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-1 text-muted/80">
              <li>
                That the Service will be uninterrupted, error-free, or secure.
              </li>
              <li>
                That movie recommendations will match your personal taste or
                preferences.
              </li>
              <li>
                That Netflix availability of recommended movies will remain
                unchanged after our recommendation is sent.
              </li>
              <li>
                The accuracy of IMDb ratings or other third-party data
                referenced.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Recon and its creators
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising from your use of the
              Service, including but not limited to loss of data, revenue, or
              goodwill.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              7. Subscription & Unsubscription
            </h2>
            <p>
              Subscribing to Recon is free and voluntary. You may unsubscribe at
              any time by clicking the unsubscribe link included in every email
              we send. Upon unsubscription, your email address will be removed
              from our active mailing list.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              8. Content & Recommendations
            </h2>
            <p>
              Our movie recommendations are based on IMDb ratings and human
              editorial judgment. They are intended as suggestions only and do
              not constitute professional advice. Individual enjoyment of
              recommended content may vary.
            </p>
            <p className="mt-3">
              Netflix content availability varies by region and is subject to
              change without notice. Recon is not responsible for regional
              content restrictions on Netflix.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              9. Modifications to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time.
              Changes will be effective upon posting the updated terms on this
              page with a new &quot;Last updated&quot; date. Continued use of
              the Service after changes constitutes acceptance of the modified
              terms.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              10. Termination
            </h2>
            <p>
              We reserve the right to terminate or suspend your access to the
              Service at any time, without notice, for conduct that we believe
              violates these Terms or is harmful to other users, us, or third
              parties.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              11. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              applicable laws, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              12. Contact
            </h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us at:
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
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <span className="text-white/10">·</span>
            <span>© {new Date().getFullYear()} Recon</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
