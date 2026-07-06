"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dumbbell, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/config";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/pricing", label: "Harga" },
  { href: "/trainers", label: "Trainer" },
  { href: "/bmi", label: "Kalkulator BMI" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-brand-600/20 bg-ink-950/95 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500 bg-brand-600/10 text-brand-500">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="font-serif text-lg font-bold uppercase tracking-widest text-white">
            Atlas <span className="text-brand-500">Sports</span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-400 transition-colors hover:text-brand-500"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:text-white"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-brand-700/30 transition-transform hover:-translate-y-0.5"
          >
            Gabung
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-200 hover:bg-white/10 lg:hidden"
          aria-label="Buka menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink-950/98 px-5 py-5 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium uppercase tracking-wide text-zinc-300"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-white/10" />
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-sm font-medium uppercase tracking-wide text-zinc-300"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="rounded bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-white"
            >
              Gabung Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
