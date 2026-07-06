"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Participant = {
  booking_id: string;
  user_id: string | null;
  nama: string;
  foto: string | null;
  status: string | null;
};

export default function AttendanceList({
  classId,
  tanggal,
  initial,
}: {
  classId: string;
  tanggal: string;
  initial: Participant[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Participant[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onDate(e: React.ChangeEvent<HTMLInputElement>) {
    router.push(`/trainer/classes/${classId}?tanggal=${e.target.value}`);
  }

  async function toggle(bookingId: string, hadir: boolean) {
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      return;
    }
    setBusy(bookingId);
    setError(null);
    const { error } = await supabase.rpc("mark_attendance", {
      p_booking_id: bookingId,
      p_hadir: hadir,
    });
    setBusy(null);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.booking_id === bookingId
          ? { ...r, status: hadir ? "completed" : "upcoming" }
          : r,
      ),
    );
    router.refresh();
  }

  const hadir = rows.filter((r) => r.status === "completed").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-ink-800 p-4">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <Calendar className="h-4 w-4 text-zinc-500" />
          Tanggal
          <input
            type="date"
            value={tanggal}
            onChange={onDate}
            className="rounded-lg border border-white/10 bg-ink-950 px-3 py-1.5 text-sm text-white outline-none [color-scheme:dark] focus:border-brand-500"
          />
        </label>
        <span className="text-sm font-medium text-zinc-400">
          Hadir {hadir} / {rows.length}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-brand-500/30 bg-brand-600/10 px-4 py-3 text-sm text-brand-300">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-10 text-center text-sm text-zinc-500">
          Belum ada peserta yang booking kelas ini pada tanggal tersebut.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-ink-800">
          <ul className="divide-y divide-white/5">
            {rows.map((r) => {
              const present = r.status === "completed";
              return (
                <li
                  key={r.booking_id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold text-white">
                      {(r.nama || "?").charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium text-white">{r.nama}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(r.booking_id, !present)}
                    disabled={busy === r.booking_id}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                      present
                        ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                        : "border border-white/15 text-zinc-300 hover:border-brand-500 hover:text-brand-500"
                    }`}
                  >
                    {busy === r.booking_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {present ? "Hadir" : "Tandai hadir"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}