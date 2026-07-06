import type { Metadata } from "next";
import { Clock, User, Layers, Users } from "lucide-react";
import { getClassesForBooking } from "@/lib/queries";
import { formatJam } from "@/lib/format";
import BookClassButton from "@/components/BookClassButton";

export const metadata: Metadata = {
  title: "Jadwal Kelas",
};

export default async function ClassesPage() {
  const { classes, terisi } = await getClassesForBooking();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Jadwal Kelas
        </h1>
        <p className="mt-1 text-zinc-400">
          Pilih tanggal lalu booking kelas. Sisa slot dihitung untuk hari ini.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-10 text-center text-zinc-500">
          Belum ada kelas yang tersedia.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => {
            const cap = c.kapasitas ?? 0;
            const used = terisi[c.id] ?? 0;
            const sisa = cap > 0 ? Math.max(cap - used, 0) : null;
            const full = cap > 0 && used >= cap;
            return (
              <div
                key={c.id}
                className="flex flex-col rounded-xl border border-white/8 bg-ink-800 p-5 transition-colors hover:border-brand-500/30"
              >
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                    {c.kategori ?? "Umum"}
                  </span>
                  {c.hari && (
                    <span className="text-sm font-medium text-zinc-500">
                      {c.hari}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {c.nama}
                </h3>
                {c.deskripsi && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {c.deskripsi}
                  </p>
                )}

                <div className="mt-3 space-y-1.5 text-sm text-zinc-400">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-600" />
                    {formatJam(c.jam)}
                    {c.durasi ? ` · ${c.durasi} menit` : ""}
                  </p>
                  {c.trainer && (
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4 text-zinc-600" /> {c.trainer}
                    </p>
                  )}
                  {c.level && (
                    <p className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-zinc-600" /> Level{" "}
                      {c.level}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-zinc-600" />
                    {cap > 0
                      ? full
                        ? "Penuh hari ini"
                        : `${sisa} dari ${cap} slot tersisa (hari ini)`
                      : "Kapasitas tidak dibatasi"}
                  </p>
                </div>

                <div className="mt-5">
                  <BookClassButton classId={c.id} full={full} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
