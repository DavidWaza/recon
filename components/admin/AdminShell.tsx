"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/ui/Icon";

export const ADMIN_BASE = "/lock-waza-secret";

const NAV: { href: string; label: string; short: string; icon: IconName; blurb: string }[] = [
  {
    href: ADMIN_BASE,
    label: "Weekly picks",
    short: "Picks",
    icon: "film",
    blurb: "Build & send Friday's list",
  },
  {
    href: `${ADMIN_BASE}/send-message`,
    label: "Broadcast",
    short: "Broadcast",
    icon: "megaphone",
    blurb: "News & announcements",
  },
  {
    href: `${ADMIN_BASE}/metrics`,
    label: "Metrics",
    short: "Metrics",
    icon: "chart",
    blurb: "Audience, clicks, revenue",
  },
];

function isActive(pathname: string, href: string) {
  return href === ADMIN_BASE ? pathname === href : pathname.startsWith(href);
}

/**
 * Admin chrome, mobile-first:
 *  - phone/tablet: compact sticky top bar + a fixed bottom tab bar, so every
 *    section is one thumb-tap away and nothing hides behind a hamburger.
 *  - lg and up: a fixed left rail with descriptions; the tab bar disappears.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ADMIN_BASE;
  const current = NAV.find((n) => isActive(pathname, n.href)) ?? NAV[0];

  return (
    <div className="relative min-h-dvh bg-background">
      {/* Ambient backdrop — gives the canvas depth without competing with data. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-accent-500/7 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-[24rem] w-[32rem] rounded-full bg-flow-secondary/5 blur-[120px]" />
      </div>

      {/* ---------- Desktop rail ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-base-0/80 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <Brand />
        </div>

        <nav aria-label="Admin" className="flex-1 space-y-1 p-3">
          <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
            Workspace
          </p>
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                  active ? "text-foreground" : "text-muted hover:bg-base-100 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-rail-active"
                    aria-hidden
                    className="absolute inset-0 rounded-xl border border-accent-150 bg-accent-50"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                  />
                )}
                <span
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-lg border transition-colors",
                    active
                      ? "border-accent-500/40 bg-accent-500 text-base-950 shadow-glow"
                      : "border-border bg-surface text-muted group-hover:text-foreground",
                  )}
                >
                  <Icon name={item.icon} className="size-[18px]" />
                </span>
                <span className="relative min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block truncate text-xs text-subtle">{item.blurb}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-base-100 hover:text-foreground"
          >
            <span className="flex items-center gap-2.5">
              <Icon name="external" className="size-[18px]" />
              View live site
            </span>
            <Icon name="arrow-up-right" className="size-4" />
          </Link>
        </div>
      </aside>

      {/* ---------- Mobile top bar ---------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-base-0/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Brand compact />
          <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
            <Icon name={current.icon} className="size-4 text-accent-500" />
            <span className="truncate">{current.label}</span>
          </span>
          <Link
            href="/"
            aria-label="View live site"
            className="flex size-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground"
          >
            <Icon name="external" className="size-[18px]" />
          </Link>
        </div>
      </header>

      {/* ---------- Content ---------- */}
      <div className="relative lg:pl-64">
        {/* Bottom padding clears the mobile tab bar + home indicator. */}
        <main className="mx-auto w-full max-w-7xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8 lg:px-10 lg:pb-16 lg:pt-10">
          {children}
        </main>
      </div>

      {/* ---------- Mobile bottom tab bar ---------- */}
      <nav
        aria-label="Admin"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-base-0/90 backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-3 gap-1 px-3 pt-2">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition-colors",
                    active ? "text-foreground" : "text-subtle hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-tab-active"
                      aria-hidden
                      className="absolute inset-0 rounded-2xl bg-accent-50 ring-1 ring-accent-150"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                    />
                  )}
                  <Icon
                    name={item.icon}
                    className={cn("relative size-[22px]", active && "text-accent-500")}
                  />
                  <span className="relative">{item.short}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href={ADMIN_BASE} className="flex shrink-0 items-center gap-2.5">
      <Image src="/icon.png" alt="" width={32} height={32} className="rounded-lg ring-1 ring-border" />
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-bold tracking-tight text-foreground">Recon</span>
          <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
            Control room
          </span>
        </span>
      )}
      {compact && <span className="sr-only">Recon admin</span>}
    </Link>
  );
}
