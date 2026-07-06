"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { todayISO } from "@/lib/format";

export default function BookClassButton({
  classId,
  full,
}: {
  classId: string;
  full: boolean;
}) {
  const router = useRouter();
  const today = todayISO();
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const disabled = loading || (full && date === today);

  async function handleBook() {
    const supabase = createClient();
    if (!supabase) {
      setMsg({ text: "Supabase belum dikonfigurasi.", ok: false });
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setMsg(null);

    // book_class = RPC atomik: cek langganan aktif, kuota, & booking ganda.
    const { error } = await supabase.rpc("book_class", {
      p_class_id: classId,
      p_tanggal: date,
    });

    setLoading(false);
    if (error) {
      setMsg({ text: error.message, ok: false });
      return;
    }
    setMsg({ text: "Berhasil booking!", ok: true });
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <input
        type="date"
        min={today}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none [color-scheme:dark] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      />
      <button
        type="button"
        onClick={handleBook}
        disabled={disabled}
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
          disabled
            ? "cursor-not-allowed bg-white/5 text-zinc-600"
            : "bg-gradient-to-r from-brand-500 to-brand-700 text-white hover:-translate-y-0.5"
        }`}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {full && date === today
          ? "Penuh hari ini"
          : loading
            ? "Memproses..."
            : "Booking Kelas"}
      </button>
      {msg && (
        <p
          className={`text-center text-xs ${
            msg.ok ? "text-emerald-400" : "text-brand-400"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
