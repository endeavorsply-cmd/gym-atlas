import type { Metadata } from "next";
import { CalendarCheck, Flame, Activity, CalendarClock } from "lucide-react";
import { getMyProgress } from "@/lib/queries";
import { formatTanggal } from "@/lib/format";
import BarChart from "@/components/BarChart";

export const metadata: Metadata = {
  title: "Progress",
};

export default async function ProgressPage() {
  const p = await getMyProgress();

  const cards = [
    {
      label: "Total kunjungan",
      value: String(p.totalSessions),
      icon: Activity,
      tint: "border-brand-500/20 bg-brand-600/10 text-brand-500",
    },
    {
      label: "Bulan ini",
      value: String(p.thisMonth),
      icon: CalendarCheck,
      tint: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Streak (hari beruntun)",
      value: String(p.streakDays),
      icon: Flame,
      tint: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    },
    {
      label: "Kunjungan terakhir",
      value: p.lastVisit ? formatTanggal(p.lastVisit) : "-",
      icon: CalendarClock,
      tint: "border-violet-500/20 bg-violet-500/10 text-violet-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Progress Saya
        </h1>
        <p className="mt-1 text-zinc-400">
          Pantau konsistensi latihanmu dari waktu ke waktu.
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

      <div className="rounded-2xl border border-white/8 bg-ink-800 p-6">
        <h2 className="font-serif text-lg font-bold text-white">
          Kehadiran 6 bulan terakhir
        </h2>
        <p className="mb-6 mt-1 text-sm text-zinc-500">
          Jumlah check-in per bulan.
        </p>
        {p.totalSessions === 0 ? (
          <p className="text-sm text-zinc-500">
            Belum ada data kehadiran. Yuk mulai check-in saat datang ke gym!
          </p>
        ) : (
          <BarChart data={p.monthly} />
        )}
      </div>
    </div>
  );
}
