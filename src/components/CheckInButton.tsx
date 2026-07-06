"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase";

/**
 * Tombol check-in kehadiran harian. Memanggil RPC `check_in` (maks 1x/hari,
 * butuh langganan aktif) lalu memperbarui statistik dashboard.
 */
export default function CheckInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleCheckIn() {
    const supabase = createClient();
    if (!supabase) {
      setMsg({ text: "Supabase belum dikonfigurasi.", ok: false });
      return;
    }
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.rpc("check_in");
    setLoading(false);
    if (error) {
      setMsg({ text: error.message, ok: false });
      return;
    }
    setMsg({ text: "Check-in berhasil! Semangat latihan 💪", ok: true });
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleCheckIn}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        {loading ? "Memproses..." : "Check-in Hari Ini"}
      </button>
      {msg && (
        <p
          className={`text-xs ${msg.ok ? "text-emerald-400" : "text-brand-400"}`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
