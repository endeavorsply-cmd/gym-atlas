"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function CancelBookingButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!window.confirm("Batalkan booking ini?")) return;
    const supabase = createClient();
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id);
    setLoading(false);
    if (error) {
      window.alert(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/40 px-3 py-1.5 text-xs font-semibold text-brand-400 transition-colors hover:bg-brand-600/10 disabled:opacity-60"
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      Batalkan
    </button>
  );
}
