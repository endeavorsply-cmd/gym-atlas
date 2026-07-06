"use client";

import { QRCodeSVG } from "qrcode.react";

export default function MemberQR({
  code,
  nama,
}: {
  code: string;
  nama: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-ink-800 p-6 text-center">
      <h2 className="font-serif text-lg font-bold text-white">Kartu Anggota</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Tunjukkan QR ini di resepsionis untuk check-in.
      </p>
      <div className="mx-auto mt-5 w-fit rounded-xl bg-white p-4">
        <QRCodeSVG value={code} size={176} level="M" />
      </div>
      <p className="mt-4 font-semibold text-white">{nama}</p>
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        ID {code.slice(0, 8)}
      </p>
    </div>
  );
}
