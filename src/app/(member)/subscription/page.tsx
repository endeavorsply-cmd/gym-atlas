import type { Metadata } from "next";
import { Check, CreditCard, Calendar } from "lucide-react";
import {
  getMySubscription,
  getMyTransactions,
  getPackages,
} from "@/lib/queries";
import { formatRupiah, formatTanggal, periodLabel } from "@/lib/format";
import PricingCard from "@/components/PricingCard";

export const metadata: Metadata = {
  title: "Langganan",
};

export default async function SubscriptionPage() {
  const [{ subscription, pkg }, transactions, packages] = await Promise.all([
    getMySubscription(),
    getMyTransactions(),
    getPackages(),
  ]);

  const fitur = pkg && Array.isArray(pkg.fitur) ? pkg.fitur : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Langganan
        </h1>
        <p className="mt-1 text-zinc-400">
          Kelola paket membership dan lihat riwayat pembayaran.
        </p>
      </div>

      {!subscription ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-8 text-center">
            <p className="font-medium text-zinc-200">
              Kamu belum punya langganan aktif.
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Pilih salah satu paket di bawah ini untuk mulai berlatih.
            </p>
          </div>

          {packages.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">
              Belum ada paket yang tersedia.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {packages.map((p) => (
                <PricingCard key={p.id} pkg={p} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 p-6 text-white lg:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-ink-900 to-black" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-600/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize">
                  {subscription.status ?? "aktif"}
                </span>
                <CreditCard className="h-6 w-6 text-white/70" />
              </div>
              <h2 className="mt-6 font-serif text-3xl font-bold">
                {pkg?.nama ?? "Paket"}
              </h2>
              {pkg?.deskripsi && (
                <p className="mt-1 text-zinc-300">{pkg.deskripsi}</p>
              )}
              <div className="mt-6 flex items-center gap-2 text-sm text-zinc-300">
                <Calendar className="h-4 w-4" />
                {formatTanggal(subscription.tanggal_mulai)} —{" "}
                {formatTanggal(subscription.tanggal_selesai)}
              </div>
              {pkg && (
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-serif text-2xl font-bold">
                    {formatRupiah(pkg.harga)}
                  </span>
                  <span className="text-sm text-zinc-400">
                    /{periodLabel(pkg.durasi_hari)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-ink-800 p-6">
            <h3 className="font-semibold text-white">Benefit paketmu</h3>
            {fitur.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {fitur.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-300"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">
                Tidak ada rincian benefit.
              </p>
            )}
            <a
              href="#paket"
              className="mt-6 block rounded-lg border border-white/15 py-2.5 text-center text-sm font-semibold text-zinc-200 transition-colors hover:border-brand-500 hover:text-brand-500"
            >
              Ganti / Upgrade Paket
            </a>
          </div>
        </div>
      )}

      {/* Daftar paket untuk ganti / upgrade (hanya tampil bila sudah punya langganan). */}
      {subscription && packages.length > 0 && (
        <div id="paket" className="scroll-mt-24">
          <h2 className="text-lg font-semibold text-white">
            Ganti atau upgrade paket
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Pilih paket baru langsung dari sini tanpa keluar dari dashboard.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {packages.map((p) => (
              <PricingCard key={p.id} pkg={p} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white">Riwayat pembayaran</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/8 bg-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-700 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Order ID</th>
                <th className="px-5 py-3 font-semibold">Tanggal</th>
                <th className="px-5 py-3 font-semibold">Metode</th>
                <th className="px-5 py-3 font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-6 text-center text-zinc-500"
                  >
                    Belum ada pembayaran.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5">
                    <td className="px-5 py-4 font-medium text-white">
                      {t.order_id}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {formatTanggal((t.created_at ?? "").slice(0, 10) || null)}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {t.metode_bayar ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {formatRupiah(t.jumlah)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
