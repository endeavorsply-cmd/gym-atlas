import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Trophy,
  Activity,
  ArrowRight,
  Clock,
} from "lucide-react";
import { getDashboardData, getMyCheckinCode } from "@/lib/queries";
import { formatJam, formatTanggal } from "@/lib/format";
import Greeting from "@/components/Greeting";
import CheckInButton from "@/components/CheckInButton";
import MemberQR from "@/components/MemberQR";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
const { upcoming, recommended, stats } = await getDashboardData();
const card = await getMyCheckinCode();

  const cards = [
    {
      label: "Kunjungan tercatat",
      value: String(stats.sessions),
      icon: Activity,
      tint: "border-brand-500/20 bg-brand-600/10 text-brand-500",
    },
    {
      label: "Booking aktif",
      value: String(stats.bookings),
      icon: CalendarDays,
      tint: "border-violet-500/20 bg-violet-500/10 text-violet-400",
    },
    {
      label: "Status langganan",
      value: stats.active ? "Aktif" : "Nonaktif",
      icon: CheckCircle2,
      tint: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Kelas tersedia",
      value: String(recommended.length),
      icon: Trophy,
      tint: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Greeting />
          <p className="mt-1 text-zinc-400">
            Ini ringkasan aktivitas kebugaranmu.
          </p>
        </div>
        <CheckInButton />
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
              <div className="mt-4 font-serif text-2xl font-bold text-white">
                {s.value}
              </div>
              <div className="text-sm text-zinc-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Booking mendatang
            </h2>
            <Link
              href="/my-bookings"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-400"
            >
              Semua booking <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-8 text-center text-sm text-zinc-500">
                Belum ada booking mendatang.
              </div>
            ) : (
              upcoming.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-800 p-4"
                >
                  <div>
                    <p className="font-semibold text-white">{b.className}</p>
                    <p className="text-sm text-zinc-500">{b.trainer ?? "-"}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                    <Clock className="h-4 w-4 text-zinc-600" />
                    {formatTanggal(b.tanggal)}
                    {b.jam ? ` · ${formatJam(b.jam)}` : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      <div>
        {card && (
        <div className="mb-6">
          <MemberQR code={card.code} nama={card.nama} />
        </div>
       )}
      <h2 className="text-lg font-semibold text-white">
        Rekomendasi kelas
      </h2>
          <div className="mt-4 space-y-3">
            {recommended.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-8 text-center text-sm text-zinc-500">
                Belum ada kelas.
              </div>
            ) : (
              recommended.map((c) => (
                <Link
                  key={c.id}
                  href="/classes"
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-800 p-4 transition-colors hover:border-brand-500/40"
                >
                  <div>
                    <p className="font-medium text-white">{c.nama}</p>
                    <p className="text-xs text-zinc-500">
                      {[c.hari, formatJam(c.jam)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {c.kategori && (
                    <span className="rounded-full bg-brand-600/10 px-2.5 py-1 text-xs font-semibold text-brand-400">
                      {c.kategori}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
