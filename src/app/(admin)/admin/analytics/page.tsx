import type { Metadata } from "next";
import { Users, TrendingUp } from "lucide-react";
import { getAdminAnalytics } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";
import BarChart from "@/components/BarChart";

export const metadata: Metadata = {
  title: "Analitik",
};

function rupiahSingkat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}rb`;
  return String(n);
}

export default async function AnalyticsPage() {
  const a = await getAdminAnalytics();
  const totalRevenue = a.revenueMonthly.reduce((s, m) => s + m.value, 0);
  const churn = Math.max(0, a.members - a.activeSubs);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Analitik
        </h1>
        <p className="mt-1 text-zinc-400">
          Analisa performa gym secara lebih mendalam.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/8 bg-ink-800 p-5">
          <div className="font-serif text-xl font-bold text-white">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-sm text-zinc-500">Pendapatan 6 bulan</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-ink-800 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div className="mt-4 font-serif text-xl font-bold text-white">
            {a.activeSubs}
          </div>
          <div className="text-sm text-zinc-500">Member aktif</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-ink-800 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-500/20 bg-zinc-500/10 text-zinc-400">
            <Users className="h-5 w-5" />
          </span>
          <div className="mt-4 font-serif text-xl font-bold text-white">
            {churn}
          </div>
          <div className="text-sm text-zinc-500">Member non-aktif</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-ink-800 p-6">
        <h2 className="font-serif text-lg font-bold text-white">
          Pendapatan per bulan
        </h2>
        <p className="mb-6 mt-1 text-sm text-zinc-500">
          Total transaksi lunas (6 bulan terakhir).
        </p>
        <BarChart
          data={a.revenueMonthly}
          tint="from-violet-500 to-violet-700"
          format={rupiahSingkat}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-ink-800 p-6">
          <h2 className="font-serif text-lg font-bold text-white">
            Kehadiran per hari
          </h2>
          <p className="mb-6 mt-1 text-sm text-zinc-500">
            Distribusi check-in berdasarkan hari.
          </p>
          <BarChart
            data={a.attendanceWeekday}
            tint="from-emerald-500 to-emerald-700"
          />
        </div>

        <div className="rounded-2xl border border-white/8 bg-ink-800 p-6">
          <h2 className="font-serif text-lg font-bold text-white">
            Kelas terpopuler
          </h2>
          <p className="mb-6 mt-1 text-sm text-zinc-500">
            Berdasarkan jumlah booking.
          </p>
          {a.popularClasses.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada data booking.</p>
          ) : (
            <div className="space-y-3">
              {a.popularClasses.map((c, i) => (
                <div key={c.nama} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600/15 text-xs font-bold text-brand-400">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm text-white">
                    {c.nama}
                  </span>
                  <span className="text-sm font-semibold text-zinc-400">
                    {c.value}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
