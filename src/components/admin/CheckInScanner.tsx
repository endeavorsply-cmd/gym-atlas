"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

type CheckinResult = {
  status: "success" | "already" | "expired" | "error";
  nama?: string;
  valid_until?: string | null;
  message: string;
};

// Menghentikan kamera dengan aman: hanya stop kalau memang sedang berjalan.
async function safeStop(scanner: Html5Qrcode | null) {
  if (!scanner) return;
  try {
    const state = scanner.getState();
    if (
      state === Html5QrcodeScannerState.SCANNING ||
      state === Html5QrcodeScannerState.PAUSED
    ) {
      await scanner.stop();
    }
    scanner.clear();
  } catch {
    // abaikan — kamera memang belum berjalan
  }
}

export default function CheckInScanner() {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lockRef = useRef(false);

  async function handleCode(code: string) {
    const supabase = createClient();
    if (!supabase) {
      setResult({ status: "error", message: "Supabase belum dikonfigurasi." });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("check_in_by_code", {
      p_code: code,
    });
    setLoading(false);
    if (error) {
      setResult({
        status: "error",
        message: "QR tidak valid atau terjadi kesalahan.",
      });
      return;
    }
    setResult(data as CheckinResult);
  }

  async function start() {
    setResult(null);
    try {
      const scanner = new Html5Qrcode("qr-reader");
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (lockRef.current) return;
          lockRef.current = true;
          await handleCode(decodedText);
          setTimeout(() => {
            lockRef.current = false;
          }, 2500);
        },
        () => {},
      );
      scannerRef.current = scanner;
      setScanning(true);
    } catch {
      scannerRef.current = null;
      setScanning(false);
      setResult({
        status: "error",
        message:
          "Tidak bisa mengakses kamera. Pastikan izin kamera aktif dan halaman dibuka via localhost atau https.",
      });
    }
  }

  async function stop() {
    await safeStop(scannerRef.current);
    scannerRef.current = null;
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      safeStop(scannerRef.current);
      scannerRef.current = null;
    };
  }, []);

  const styles: Record<CheckinResult["status"], string> = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    already: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    expired: "border-brand-500/30 bg-brand-600/10 text-brand-400",
    error: "border-brand-500/30 bg-brand-600/10 text-brand-400",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Scan Check-in
        </h1>
        <p className="mt-1 text-zinc-400">
          Arahkan kamera ke QR kartu anggota untuk mencatat kehadiran.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-ink-800 p-6">
          <div
            id="qr-reader"
            className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl bg-ink-950"
          />
          <div className="mt-5 flex justify-center">
            {scanning ? (
              <button
                type="button"
                onClick={stop}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5"
              >
                <CameraOff className="h-4 w-4" /> Hentikan Kamera
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-700/30 hover:-translate-y-0.5"
              >
                <Camera className="h-4 w-4" /> Mulai Scan
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-ink-800 p-6">
          <h2 className="font-serif text-lg font-bold text-white">Hasil</h2>
          {loading && (
            <div className="mt-4 flex items-center gap-2 text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
            </div>
          )}
          {!loading && !result && (
            <p className="mt-4 text-sm text-zinc-500">
              Belum ada scan. Mulai kamera lalu arahkan ke QR anggota.
            </p>
          )}
          {!loading && result && (
            <div
              className={`mt-4 rounded-xl border p-5 ${styles[result.status]}`}
            >
              <div className="flex items-center gap-2">
                {result.status === "success" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : result.status === "already" ? (
                  <Clock className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
                <span className="text-lg font-bold">
                  {result.status === "success" && "Check-in Berhasil"}
                  {result.status === "already" && "Sudah Check-in"}
                  {result.status === "expired" && "Langganan Tidak Aktif"}
                  {result.status === "error" && "Gagal"}
                </span>
              </div>
              {result.nama && (
                <p className="mt-3 text-xl font-bold text-white">
                  {result.nama}
                </p>
              )}
              <p className="mt-1 text-sm text-zinc-300">{result.message}</p>
              {result.valid_until && (
                <p className="mt-2 text-xs text-zinc-400">
                  Langganan aktif s/d {result.valid_until}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
