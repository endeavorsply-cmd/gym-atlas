"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { formatRupiah, formatTanggal } from "@/lib/format";
import type { TransactionView } from "@/lib/types";

const statusStyle: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-400",
  pending: "bg-orange-500/10 text-orange-400",
  failed: "bg-brand-600/10 text-brand-400",
};

const statusLabel: Record<string, string> = {
  paid: "Lunas",
  pending: "Menunggu",
  failed: "Gagal",
};

function ConfirmButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function confirm() {
    if (
      !window.confirm(
        "Tandai transaksi ini sebagai lunas & aktifkan langganan?",
      )
    )
      return;
    const supabase = createClient();
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.rpc("confirm_transaction", { p_id: id });
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
      onClick={confirm}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" />
      )}
      Tandai Lunas
    </button>
  );
}

export default function TransactionManager({
  initial,
}: {
  initial: TransactionView[];
}) {
  const total = initial
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.jumlah, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            Transaksi
          </h1>
          <p className="mt-1 text-zinc-400">
            Riwayat pembayaran & konfirmasi manual.
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-ink-800 px-5 py-3">
          <p className="text-xs text-zinc-500">Total pendapatan (lunas)</p>
          <p className="font-serif text-lg font-bold text-brand-500">
            {formatRupiah(total)}
          </p>
        </div>
      </div>

      {initial.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-10 text-center text-zinc-500">
          Belum ada transaksi, atau kamu tidak punya akses (butuh policy admin).
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-700 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Order ID</th>
                <th className="px-5 py-3 font-semibold">Anggota</th>
                <th className="px-5 py-3 font-semibold">Paket</th>
                <th className="px-5 py-3 font-semibold">Tanggal</th>
                <th className="px-5 py-3 font-semibold">Jumlah</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {initial.map((t) => {
                const status = t.status ?? "pending";
                return (
                  <tr key={t.id} className="hover:bg-white/5">
                    <td className="px-5 py-4 font-medium text-white">
                      {t.order_id}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {t.memberName ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {t.packageName ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {formatTanggal((t.created_at ?? "").slice(0, 10) || null)}
                    </td>
                    <td className="px-5 py-4 font-medium text-white">
                      {formatRupiah(t.jumlah)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status] ?? "bg-white/5 text-zinc-500"}`}
                      >
                        {statusLabel[status] ?? status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {status !== "paid" ? (
                        <ConfirmButton id={t.id} />
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
