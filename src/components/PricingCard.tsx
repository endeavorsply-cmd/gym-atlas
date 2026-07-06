import { Check } from "lucide-react";
import type { PackageRow } from "@/lib/types";
import { formatRupiah, periodLabel } from "@/lib/format";
import CheckoutButton from "@/components/CheckoutButton";

export default function PricingCard({ pkg }: { pkg: PackageRow }) {
  const fitur = Array.isArray(pkg.fitur) ? pkg.fitur : [];

  return (
    <div
      className={`relative flex flex-col rounded-lg border p-8 transition-all duration-300 ${
        pkg.is_popular
          ? "border-brand-500/60 bg-gradient-to-b from-brand-950/40 to-ink-800 shadow-2xl shadow-brand-900/30"
          : "border-white/8 bg-ink-800 hover:-translate-y-1 hover:border-brand-500/40"
      }`}
    >
      {pkg.is_popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-1 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white shadow-lg">
          ⭐ Paling Populer
        </span>
      )}

      <h3 className="font-serif text-xl font-bold text-white">{pkg.nama}</h3>
      {pkg.deskripsi && (
        <p className="mt-1 text-sm text-zinc-400">{pkg.deskripsi}</p>
      )}

      <div className="mt-6 flex items-baseline gap-1">
        <span
          className={`font-serif text-4xl font-bold tracking-tight ${
            pkg.is_popular ? "text-brand-500" : "text-white"
          }`}
        >
          {formatRupiah(pkg.harga)}
        </span>
        <span className="text-sm text-zinc-500">
          /{periodLabel(pkg.durasi_hari)}
        </span>
      </div>

      <div className="mt-6 h-px w-full bg-white/10" />

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {fitur.map((feature, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-sm text-zinc-300"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <CheckoutButton pkg={pkg} />
      </div>
    </div>
  );
}
