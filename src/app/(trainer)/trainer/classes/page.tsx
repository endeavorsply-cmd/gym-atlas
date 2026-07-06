import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock, ChevronRight } from "lucide-react";
import { getTrainerClasses } from "@/lib/trainer-queries";
import { formatJam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kelas Saya",
};

export default async function TrainerClassesPage() {
  const classes = await getTrainerClasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Kelas Saya
        </h1>
        <p className="mt-1 text-zinc-400">
          Pilih kelas untuk melihat peserta dan menandai kehadiran.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-10 text-center text-sm text-zinc-500">
          Belum ada kelas yang ditugaskan kepadamu. Hubungi admin untuk
          menautkan kelas ke akunmu.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/trainer/classes/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-800 p-5 transition-colors hover:border-brand-500/40"
            >
              <div>
                <p className="font-semibold text-white">{c.nama}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                  <CalendarDays className="h-3.5 w-3.5" /> {c.hari ?? "-"}
                  <Clock className="ml-2 h-3.5 w-3.5" /> {formatJam(c.jam)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-600" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}