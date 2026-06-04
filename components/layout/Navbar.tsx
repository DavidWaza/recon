"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why Recon", href: "#why-recon" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <nav className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 px-5 py-3 backdrop-blur-xl">
          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <Image
              src="/icon.png"
              alt="Recon logo"
              width={28}
              height={28}
              priority
              className="rounded-lg"
            />
            <span className="text-sm font-bold text-white tracking-tight">Recon</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="ml-2 h-5 w-px bg-white/10" />
            <a
              href="#subscribe"
              className="ml-2 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Subscribe
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-white sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>

          {/* Mobile menu */}
          {isOpen && (
            <div className="absolute inset-x-0 top-full mt-2 rounded-2xl border border-white/10 bg-black/90 p-4 backdrop-blur-xl sm:hidden">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="my-2 h-px bg-white/10" />
                <a
                  href="#subscribe"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-accent px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-accent/25"
                >
                  Subscribe
                </a>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
