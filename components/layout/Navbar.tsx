import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";

export function Navbar() {
  return (
    <header className="fixed top-4 left-1/2 z-50  -translate-x-1/2 rounded-full border border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_-48px_rgba(15,23,42,0.6)]">
      <div className="flex w-full items-center justify-center gap-4 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground ">
            Recon
          </span>
        </Link>
      </div>
    </header>
  );
}
