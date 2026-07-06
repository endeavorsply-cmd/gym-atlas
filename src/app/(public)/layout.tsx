import Link from "next/link";
import {
  Dumbbell,
  Instagram,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { siteConfig } from "@/lib/config";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <Navbar />
      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-ink-900">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-10">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500 bg-brand-600/10 text-brand-500">
                  <Dumbbell className="h-5 w-5" />
                </span>
                <span className="font-serif text-lg font-bold uppercase tracking-widest text-white">
                  Atlas <span className="text-brand-500">Sports</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                Pusat kebugaran premium di Malang dengan standar internasional.
                Wujudkan versi terbaik dirimu bersama Atlas Sports Club.
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-500"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-500"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href={siteConfig.phoneUrl}
                  aria-label="Telepon"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-500"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Menu */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
                Menu
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-zinc-400">
                <li>
                  <Link href="/pricing" className="hover:text-brand-500">
                    Harga
                  </Link>
                </li>
                <li>
                  <Link href="/trainers" className="hover:text-brand-500">
                    Trainer
                  </Link>
                </li>
                <li>
                  <Link href="/bmi" className="hover:text-brand-500">
                    Kalkulator BMI
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-brand-500">
                    Daftar
                  </Link>
                </li>
              </ul>
            </div>

            {/* Layanan */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
                Layanan
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-zinc-400">
                <li>Personal Training</li>
                <li>Kelas Grup</li>
                <li>Konsultasi Nutrisi</li>
                <li>Body Assessment</li>
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
                Kontak
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  {siteConfig.address}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-brand-500" />
                  {siteConfig.phone}
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 shrink-0 text-brand-500" />
                  {siteConfig.whatsapp}
                </li>
                <li className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 shrink-0 text-brand-500" />@
                  {siteConfig.instagram}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-brand-500" />
                  {siteConfig.hours}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {siteConfig.name}. Seluruh hak cipta
              dilindungi.
            </p>
            <p>
              Dibuat dengan <span className="text-brand-500">♥</span> di Malang
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
