"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Why Recon", href: "#why-recon" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Solidify the bar once the hero image scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open; close it on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-4">
        <nav
          aria-label="Main"
          className={cn(
            "relative flex h-14 items-center justify-between rounded-2xl border px-3 pl-4 transition-[background-color,border-color,box-shadow] duration-300 sm:h-16 sm:px-4 sm:pl-5",
            scrolled || isOpen
              ? "border-border bg-base-0/85 shadow-pop backdrop-blur-xl"
              : "border-base-950/10 bg-base-0/40 backdrop-blur-md",
          )}
        >
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <Image
              src="/icon.png"
              alt=""
              width={30}
              height={30}
              preload
              className="rounded-lg ring-1 ring-base-950/10"
            />
            <span className="text-[15px] font-bold tracking-tight text-foreground">Recon</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-base-950/6 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mx-2 h-5 w-px bg-border" />
            <ButtonLink href="#subscribe" size="sm">
              Get weekly picks
            </ButtonLink>
          </div>

          {/* Mobile: primary CTA stays visible, menu for the rest. */}
          <div className="flex items-center gap-2 md:hidden">
            <ButtonLink href="#subscribe" size="sm" className="h-9 px-3.5 text-[13px]" onClick={() => setIsOpen(false)}>
              Subscribe
            </ButtonLink>
            <button
              type="button"
              onClick={() => setIsOpen((o) => !o)}
              className="flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-base-950/6"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <Icon name={isOpen ? "close" : "menu"} weight={2} />
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden rounded-2xl border border-border bg-base-0/95 p-2 shadow-pop backdrop-blur-xl md:hidden"
            >
              <ul className="flex flex-col">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex h-12 items-center justify-between rounded-xl px-4 text-[15px] font-medium text-foreground transition-colors hover:bg-base-100"
                    >
                      {link.label}
                      <Icon name="chevron-right" className="size-4 text-subtle" />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-2 border-t border-border p-2 pt-3">
                <ButtonLink href="#subscribe" block size="lg" onClick={() => setIsOpen(false)}>
                  Get weekly picks — free
                </ButtonLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tap-outside to close. Sits under the bar, over the page. */}
      {isOpen && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 -z-10 bg-base-0/60 backdrop-blur-[2px] md:hidden"
        />
      )}
    </header>
  );
}
