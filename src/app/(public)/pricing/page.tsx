import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getPackages } from "@/lib/queries";
import PricingCard from "@/components/PricingCard";

export const metadata: Metadata = {
  title: "Harga",
};

const faqs = [
  {
    q: "Apakah bisa membatalkan kapan saja?",
    a: "Ya. Membership bersifat bulanan dan bisa dibatalkan sebelum periode berikutnya tanpa penalti.",
  },
  {
    q: "Apakah ada biaya pendaftaran?",
    a: "Tidak ada. Harga yang tertera sudah termasuk seluruh fasilitas sesuai paket.",
  },
  {
    q: "Metode pembayaran apa saja yang didukung?",
    a: "Kartu kredit, transfer bank, GoPay, dan QRIS melalui payment gateway Midtrans.",
  },
];

export default async function PricingPage() {
  const packages = await getPackages();

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-36 md:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded border border-brand-500/30 bg-brand-600/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand-500">
          Membership
        </span>
        <h1 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
          Pilih paket keanggotaan
        </h1>
        <div className="mx-auto mt-5 h-0.5 w-16 bg-brand-500" />
        <p className="mt-5 text-zinc-400">
          Semua paket termasuk akses aplikasi Atlas Sports Club dan bisa
          di-upgrade kapan saja.
        </p>
      </div>

      {packages.length === 0 ? (
        <p className="mt-12 text-center text-zinc-500">
          Belum ada paket yang tersedia.
        </p>
      ) : (
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <PricingCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}

      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center font-serif text-3xl font-bold text-white">
          Pertanyaan umum
        </h2>
        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-lg border border-white/8 bg-ink-800 p-6"
            >
              <p className="flex items-start gap-2 font-semibold text-white">
                <Check className="mt-1 h-4 w-4 shrink-0 text-brand-500" />
                {faq.q}
              </p>
              <p className="mt-2 pl-6 text-sm text-zinc-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
