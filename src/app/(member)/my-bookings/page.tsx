import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { getMyBookings } from "@/lib/queries";
import { formatJam, formatTanggal } from "@/lib/format";
import CancelBookingButton from "@/components/CancelBookingButton";

export const metadata: Metadata = {
  title: "Booking Saya",
};

const statusStyle: Record<string, string> = {
  upcoming: "bg-brand-600/10 text-brand-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-white/5 text-zinc-500",
};

const statusLabel: Record<string, string> = {
  upcoming: "Mendatang",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default async function MyBookingsPage() {
  const bookings = await getMyBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Booking Saya
        </h1>
        <p className="mt-1 text-zinc-400">
          Riwayat dan jadwal kelas yang sudah kamu pesan.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-10 text-center text-zinc-500">
          Belum ada booking. Pesan kelas dari halaman Jadwal Kelas.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-700 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Kelas</th>
                <th className="px-5 py-3 font-semibold">Instruktur</th>
                <th className="px-5 py-3 font-semibold">Jadwal</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.map((b) => {
                const status = b.status ?? "upcoming";
                return (
                  <tr key={b.id} className="hover:bg-white/5">
                    <td className="px-5 py-4 font-medium text-white">
                      {b.className}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {b.trainer ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-600" />
                        {formatTanggal(b.tanggal)}
                        {b.jam ? ` · ${formatJam(b.jam)}` : ""}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status] ?? "bg-white/5 text-zinc-500"}`}
                      >
                        {statusLabel[status] ?? status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {status === "upcoming" ? (
                        <CancelBookingButton id={b.id} />
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
