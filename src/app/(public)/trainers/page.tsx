import type { Metadata } from "next";
import Link from "next/link";
import { Award, ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Trainer",
  description:
    "Kenali personal trainer bersertifikat Atlas Sports Club Malang yang siap mendampingi perjalanan kebugaranmu.",
};

type Trainer = {
  nama: string;
  spesialis: string;
  pengalaman: string;
  bio: string;
  inisial: string;
};

const trainers: Trainer[] = [
  {
    nama: "Dimas Prakoso",
    spesialis: "HIIT & Body Combat",
    pengalaman: "8 tahun",
    bio: "Spesialis latihan kardio intensitas tinggi untuk pembakaran lemak maksimal.",
    inisial: "DP",
  },
  {
    nama: "Sarah Wijaya",
    spesialis: "Yoga & Pilates",
    pengalaman: "6 tahun",
    bio: "Membantu anggota membangun kekuatan inti, fleksibilitas, dan ketenangan pikiran.",
    inisial: "SW",
  },
  {
    nama: "Bagus Santoso",
    spesialis: "Strength & Functional",
    pengalaman: "10 tahun",
    bio: "Ahli angkat beban dan latihan fungsional dengan fokus pada teknik yang aman.",
    inisial: "BS",
  },
  {
    nama: "Nadia Putri",
    spesialis: "Spin & Zumba",
    pengalaman: "5 tahun",
    bio: "Menghadirkan kelas penuh energi yang membuat latihan terasa seperti pesta.",
    inisial: "NP",
  },
];

export default function TrainersPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36 md:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded border border-brand-500/30 bg-brand-600/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand-500">
          Tim Kami
        </span>
        <h1 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
          Trainer bersertifikat
        </h1>
        <div className="mx-auto mt-5 h-0.5 w-16 bg-brand-500" />
        <p className="mt-5 text-zinc-400">
          Didampingi personal trainer berpengalaman untuk membantumu mencapai
          target kebugaran dengan aman dan efektif.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {trainers.map((t) => (
          <div
            key={t.nama}
            className="group flex flex-col rounded-lg border border-white/8 bg-ink-800 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 font-serif text-xl font-bold text-white">
              {t.inisial}
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">{t.nama}</h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
              {t.spesialis}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
              <Award className="h-3.5 w-3.5" /> Pengalaman {t.pengalaman}
            </p>
            <p className="mt-3 text-sm text-zinc-400">{t.bio}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-16 overflow-hidden rounded-2xl border border-brand-500/20 px-8 py-14 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/60 via-ink-900 to-black" />
        <div className="relative flex flex-col items-center gap-4">
          <h2 className="font-serif text-3xl font-bold text-white">
            Ingin sesi personal trainer?
          </h2>
          <p className="max-w-md text-zinc-400">
            Paket Pro dan Elite sudah termasuk sesi bersama personal trainer
            pilihanmu. Mulai sekarang bersama {siteConfig.shortName}!
          </p>
          <Link
            href="/pricing"
            className="mt-2 inline-flex items-center gap-2 rounded bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-xl shadow-brand-700/30 transition-transform hover:-translate-y-0.5"
          >
            Lihat Paket <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
