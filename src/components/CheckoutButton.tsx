"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { PackageRow } from "@/lib/types";

export default function CheckoutButton({ pkg }: { pkg: PackageRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  async function handleCheckout() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ packageId: pkg.id }),
      });

      let data: {
        demo?: boolean;
        redirectUrl?: string;
        token?: string;
        message?: string;
      } = {};
      try {
        data = await res.json();
      } catch {
        // abaikan jika body kosong
      }

      // Sesi tidak terbaca — TAMPILKAN pesan, JANGAN pindah halaman.
      if (res.status === 401) {
        setNotice({
          text: "Sesi berakhir. Muat ulang halaman ini, lalu coba lagi.",
          ok: false,
        });
        return;
      }

      if (!res.ok) {
        setNotice({
          text: data.message ?? "Gagal memproses. Coba lagi nanti.",
          ok: false,
        });
        return;
      }

      // Midtrans aktif + snap.js dimuat: buka popup pembayaran DI ATAS dashboard.
      const snap = (window as unknown as { snap?: { pay: Function } }).snap;
      if (data.token && snap) {
        snap.pay(data.token, {
          onSuccess: () => router.refresh(),
          onPending: () => router.refresh(),
          onClose: () =>
            setNotice({ text: "Pembayaran dibatalkan.", ok: false }),
        });
        return;
      }

      // Midtrans tanpa snap.js: redirect ke halaman pembayaran resmi Midtrans.
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      // Mode demo / berhasil dicatat: TETAP di dashboard, segarkan tampilan.
      setNotice({
        text:
          data.message ??
          "Permintaan langganan tercatat. Menunggu konfirmasi pembayaran.",
        ok: true,
      });
      router.refresh();
    } catch {
      setNotice({ text: "Terjadi kesalahan jaringan. Coba lagi.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-transform disabled:opacity-60 ${
          pkg.is_popular
            ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/30 hover:-translate-y-0.5"
            : "border border-white/15 text-white hover:border-brand-500 hover:text-brand-500"
        }`}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Memproses..." : `Pilih ${pkg.nama}`}
      </button>
      {notice && (
        <p
          className={`mt-2 text-center text-xs ${
            notice.ok ? "text-emerald-400" : "text-brand-400"
          }`}
        >
          {notice.text}
        </p>
      )}
    </div>
  );
}
