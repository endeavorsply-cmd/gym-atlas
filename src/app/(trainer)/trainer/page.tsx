import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ArrowRight,
  Clock,
} from "lucide-react";
import { getTrainerDashboard } from "@/lib/trainer-queries";
import { getMyProfile } from "@/lib/queries";
import { formatJam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Trainer",
};

export default async function TrainerDashboardPage() {
  const [{ classes, todayName, todayClasses, terisi, totalToday }, profile] =
    await Promise.all([getTrainerDashboard(), getMyProfile()]);

  const nama = profile?.nama ? profile.nama.split(" ")[0] : "Trainer";

  const cards = [
    {
      label: "Kelas diampu",
      value: String(classes.length),
      icon: CalendarDays,
      tint: "border-brand-500/20 bg-brand-600/10 text-brand-500",
    },
    {
      label: "Kelas hari ini",
      value: String(todayClasses.length),
      icon: LayoutDashboard,
      tint: "border-violet-500/20 bg-violet-500/10 text-violet-400",
    },
    {
      label: "Peserta hari ini",
      value: String(totalToday),
      icon: Users,
      tint: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Halo, {nama}
        </h1>
        <p className="mt-1 text-zinc-400">
          Ringkasan kelas yang kamu ampu hari {todayName || "ini"}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
              <div className="mt-4 font-serif text-2xl font-bold text-white">
                {s.value}
              </div>
              <div className="text-sm text-zinc-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Jadwal hari ini</h2>
          <Link
            href="/trainer/classes"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-400"
          >
            Semua kelas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {todayClasses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-8 text-center text-sm text-zinc-500">
              Tidak ada kelas terjadwal hari ini.
            </div>
          ) : (
            todayClasses.map((c) => (
              <Link
                key={c.id}
                href={`/trainer/classes/${c.id}`}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-800 p-4 transition-colors hover:border-brand-500/40"
              >
                <div>
                  <p className="font-semibold text-white">{c.nama}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                    <Clock className="h-3.5 w-3.5" /> {formatJam(c.jam)}
                    {c.level ? ` - ${c.level}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-brand-600/10 px-2.5 py-1 text-xs font-semibold text-brand-400">
                  {terisi[c.id] ?? 0} peserta
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
