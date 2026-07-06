import type { Metadata } from "next";
import { Users, Wallet, CalendarDays, TrendingUp } from "lucide-react";
import {
  getAdminStats,
  getAllProfiles,
  getAllTransactions,
} from "@/lib/queries";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminOverviewPage() {
  const [stats, profiles, transactions] = await Promise.all([
    getAdminStats(),
    getAllProfiles(),
    getAllTransactions(),
  ]);

  const cards = [
    {
      label: "Total anggota",
      value: String(stats.members),
      icon: Users,
      tint: "border-brand-500/20 bg-brand-600/10 text-brand-500",
    },
    {
      label: "Langganan aktif",
      value: String(stats.activeSubs),
      icon: TrendingUp,
      tint: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Pendapatan (lunas)",
      value: formatRupiah(stats.revenue),
      icon: Wallet,
      tint: "border-violet-500/20 bg-violet-500/10 text-violet-400",
    },
    {
      label: "Total transaksi",
      value: String(stats.transactions),
      icon: CalendarDays,
      tint: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Ringkasan
        </h1>
        <p className="mt-1 text-zinc-400">
          Pantau performa {siteConfig.shortName} secara sekilas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border border-white/8 bg-ink-800 p-5"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${s.tint}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-4 font-serif text-xl font-bold text-white">
                {s.value}
              </div>
              <div className="text-sm text-zinc-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Anggota terbaru</h2>
          <div className="mt-4 space-y-3">
            {profiles.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-800 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white">
                    {(m.nama || "?").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium text-white">{m.nama}</p>
                    <p className="text-xs text-zinc-500">
                      {formatTanggal((m.created_at ?? "").slice(0, 10) || null)}
                    </p>
                  </div>
                </div>
                {m.role && (
                  <span className="rounded-full bg-brand-600/10 px-2.5 py-1 text-xs font-semibold capitalize text-brand-400">
                    {m.role}
                  </span>
                )}
              </div>
            ))}
            {profiles.length === 0 && (
              <p className="text-sm text-zinc-500">Belum ada anggota.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">
            Transaksi terakhir
          </h2>
          <div className="mt-4 space-y-3">
            {transactions.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-800 p-4"
              >
                <div>
                  <p className="font-medium text-white">{t.order_id}</p>
                  <p className="text-xs text-zinc-500">
                    {[t.memberName, t.packageName]
                      .filter(Boolean)
                      .join(" · ") || "-"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {formatRupiah(t.jumlah)}
                </p>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-sm text-zinc-500">Belum ada transaksi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
