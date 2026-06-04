import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  product: [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Why Recon", href: "/#why-recon" },
    { label: "FAQ", href: "/#faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#0d1020]">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/icon.png"
                alt="Recon logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-bold text-white">Recon</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Curated high-rated Netflix movie recommendations delivered to your
              inbox every Friday. We help you spend less time scrolling and more
              time watching.
            </p>
            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Contact
              </p>
              <a
                href="mailto:moviereconn@gmail.com"
                className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
              >
                <svg
                  className="h-4 w-4 text-accent/60 transition-colors group-hover:text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                moviereconn@gmail.com
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Product
            </p>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Legal
            </p>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-muted/60">
            © {new Date().getFullYear()} Recon. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted/60">
            <svg
              className="h-3.5 w-3.5 text-green-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            <span>Secured with HTTPS · Your data is encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
