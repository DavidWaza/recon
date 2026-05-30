import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="fixed top-4 left-1/2 z-50  -translate-x-1/2 rounded-full border border-white/10 bg-white">
      <div className="flex w-full items-center justify-center gap-4 px-3 py-1">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <Image
            src="/icon.png"
            alt="Logo"
            width={30}
            height={30}
            priority
          />
        </Link>
      </div>
    </header>
  );
}
