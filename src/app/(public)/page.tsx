import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Dumbbell,
  CalendarDays,
  Users,
  ShieldCheck,
  Clock,
  Star,
  Phone,
} from "lucide-react";
import { getClasses, getPackages, getActivePromos } from "@/lib/queries";
import { formatJam } from "@/lib/format";
import { siteConfig } from "@/lib/config";
import PricingCard from "@/components/PricingCard";

const stats = [
  { label: "Anggota Aktif", value: "1.200+" },
  { label: "Kelas / Minggu", value: "60+" },
  { label: "Personal Trainer", value: "18" },
  { label: "Rating Anggota", value: "4.9" },
];

const features = [
  {
    icon: CalendarDays,
    title: "Booking Kelas Online",
    desc: "Pesan kelas favoritmu langsung dari dashboard, real-time & tanpa antre.",
  },
  {
    icon: Clock,
    title: "Akses Jam Fleksibel",
    desc: "Latihan sesuai jadwalmu dengan akses fasilitas premium Atlas Sports Club.",
  },
  {
    icon: Users,
    title: "Trainer Bersertifikat",
    desc: "Didampingi personal trainer berpengalaman untuk hasil yang maksimal.",
  },
  {
    icon: ShieldCheck,
    title: "Pembayaran Aman",
    desc: "Transaksi membership terenkripsi lewat payment gateway tepercaya.",
  },
];

const testimonials = [
  {
    name: "Rizky Aditya",
    sub: "Member Pro · 6 bulan",
    text: "Dalam 6 bulan bersama Atlas, saya turun 15kg dan massa otot naik signifikan. Trainer-nya profesional dan fasilitasnya premium.",
    initial: "R",
  },
  {
    name: "Nadia Kusuma",
    sub: "Member Elite · 1 tahun",
    text: "Kelasnya benar-benar mengubah rutinitas saya. Instrukturnya sabar dan detail. Saya merasa lebih segar dan fokus setiap hari.",
    initial: "N",
  },
  {
    name: "Andi Prasetyo",
    sub: "Member Basic · 3 bulan",
    text: "Investasi terbaik yang pernah saya lakukan. Bukan cuma fisik, kepercayaan diri saya juga meningkat berkat komunitas di sini.",
    initial: "A",
  },
];

export default async function HomePage() {
  const [classes, packages, promos] = await Promise.all([
    getClasses(),
    getPackages(),
    getActivePromos(),
  ]);

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900 to-black" />
        <div className="absolute -right-32 top-1/4 h-[32rem] w-[32rem] rounded-full bg-brand-600/25 blur-[120px]" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-brand-800/20 blur-[100px]" />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-32 md:px-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded border border-brand-500/30 bg-brand-600/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand-500">
              <Star className="h-3.5 w-3.5 fill-current" /> Elite Fitness Center
            </span>
            <h1 className="mt-8 font-serif text-5xl font-black leading-[1.05] text-white md:text-7xl">
              Wujudkan Versi
              <br />
              <span className="text-gradient-red">Terkuat</span> Dirimu
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
              {siteConfig.name} — pusat kebugaran premium di Malang. Pilih paket
              keanggotaan, booking kelas, dan pantau progres latihanmu dalam
              satu platform.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded bg-gradient-to-r from-brand-500 to-brand-700 px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-xl shadow-brand-700/30 transition-transform hover:-translate-y-0.5"
              >
                Mulai Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded border border-white/25 px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:border-brand-500 hover:text-brand-500"
              >
                Lihat Harga
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="border-y border-brand-500/10 bg-ink-700">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 py-12 md:grid-cols-4 md:px-10">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-4 text-center ${
                i < stats.length - 1 ? "md:border-r md:border-white/5" : ""
              }`}
            >
              <div className="font-serif text-4xl font-bold text-brand-500">
                {s.value}
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.15em] text-zinc-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== PROMO ===================== */}
      {promos.length > 0 && (
        <section className="bg-ink-950 py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                Promo Terbaru
              </span>
              <h2 className="mt-4 font-serif text-4xl font-bold text-white">
                Penawaran spesial untukmu
              </h2>
              <div className="mx-auto mt-5 h-0.5 w-16 bg-brand-500" />
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {promos.map((promo) => (
                <div
                  key={promo.id}
                  className="group overflow-hidden rounded-2xl border border-white/8 bg-ink-800"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-ink-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={promo.gambar_url}
                      alt={promo.judul}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-lg font-bold text-white">
                      {promo.judul}
                    </h3>
                    {promo.deskripsi && (
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        {promo.deskripsi}
                      </p>
                    )}
                    {promo.link_url && (
                      <a
                        href={promo.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-brand-500 hover:text-brand-400"
                      >
                        Selengkapnya <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== FEATURES ===================== */}
      <section className="bg-ink-950 py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
              Kenapa Atlas
            </span>
            <h2 className="mt-4 font-serif text-4xl font-bold text-white">
              Semua yang kamu butuhkan untuk konsisten
            </h2>
            <div className="mt-5 h-0.5 w-16 bg-brand-500" />
            <p className="mt-5 text-zinc-400">
              Atlas Sports Club menggabungkan fasilitas kelas dunia dengan
              teknologi yang memudahkan perjalanan kebugaranmu.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-lg border border-white/8 bg-ink-800 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-600/10 text-brand-500">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== CLASSES PREVIEW ===================== */}
      {classes.length > 0 && (
        <section className="bg-ink-900 py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                  Program Kami
                </span>
                <h2 className="mt-4 font-serif text-4xl font-bold text-white">
                  Kelas populer minggu ini
                </h2>
                <div className="mt-5 h-0.5 w-16 bg-brand-500" />
              </div>
              <Link
                href="/classes"
                className="hidden items-center gap-1 text-sm font-semibold uppercase tracking-wide text-brand-500 hover:text-brand-400 sm:inline-flex"
              >
                Lihat semua <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classes.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="group flex items-center gap-4 rounded-lg border border-white/8 bg-ink-800 p-5 transition-colors hover:border-brand-500/40"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                    <Dumbbell className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{c.nama}</p>
                    <p className="text-sm text-zinc-500">
                      {[c.hari, formatJam(c.jam), c.trainer]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== PRICING ===================== */}
      {packages.length > 0 && (
        <section className="bg-ink-950 py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                Harga
              </span>
              <h2 className="mt-4 font-serif text-4xl font-bold text-white">
                Investasi terbaik untuk dirimu
              </h2>
              <div className="mx-auto mt-5 h-0.5 w-16 bg-brand-500" />
              <p className="mt-5 text-zinc-400">
                Pilih paket yang sesuai dengan kebutuhan dan tujuan kebugaranmu.
                Bisa upgrade kapan saja.
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
              {packages.map((pkg) => (
                <PricingCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="bg-ink-900 py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
              Testimoni
            </span>
            <h2 className="mt-4 font-serif text-4xl font-bold text-white">
              Kata mereka
            </h2>
            <div className="mx-auto mt-5 h-0.5 w-16 bg-brand-500" />
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border border-white/8 bg-ink-800 p-7"
              >
                <div className="text-brand-500">★★★★★</div>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  {t.text}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 font-serif font-bold text-white">
                    {t.initial}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {t.name}
                    </div>
                    <div className="text-xs text-zinc-500">{t.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="bg-ink-950 pb-28 pt-4">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 px-8 py-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/60 via-ink-900 to-black" />
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/20 blur-[90px]" />
            <div className="relative">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
                Bergabung Sekarang
              </span>
              <h2 className="mt-4 font-serif text-4xl font-bold text-white md:text-5xl">
                Transformasimu dimulai hari ini
              </h2>
              <p className="mx-auto mt-4 max-w-md text-zinc-400">
                Jangan tunda lagi. Jadilah versi terbaikmu bersama Atlas Sports
                Club Malang.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded bg-gradient-to-r from-brand-500 to-brand-700 px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-xl shadow-brand-700/30 transition-transform hover:-translate-y-0.5"
                >
                  Daftar Sekarang <ArrowUpRight className="h-4 w-4" />
                </Link>
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded border border-white/25 px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:border-brand-500 hover:text-brand-500"
                >
                  <Phone className="h-4 w-4" /> Hubungi Kami
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
