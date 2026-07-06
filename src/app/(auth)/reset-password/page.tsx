"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(
        "Gagal mengganti sandi. Tautan mungkin sudah kedaluwarsa - minta tautan baru.",
      );
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-ink-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  if (done) {
    return (
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-serif text-3xl font-bold text-white">
          Sandi berhasil diubah
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Kamu akan diarahkan ke halaman masuk sebentar lagi...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white">
        Atur ulang sandi
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Masukkan kata sandi baru untuk akunmu.
      </p>

      {!ready && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Pastikan kamu membuka halaman ini lewat tautan di email. Kalau baru
          saja diklik, tunggu sebentar untuk verifikasi.
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-brand-500/30 bg-brand-600/10 px-4 py-3 text-sm text-brand-300">
          {error}
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Kata sandi baru
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Ulangi kata sandi
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="********"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-700/30 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Menyimpan..." : "Simpan sandi baru"}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-block text-sm font-semibold text-zinc-400 hover:text-white"
      >
        Kembali ke halaman masuk
      </Link>
    </div>
  );
}
