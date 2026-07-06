"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-ink-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  if (sent) {
    return (
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-serif text-3xl font-bold text-white">
          Cek email kamu
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Kalau email <span className="text-white">{email}</span> terdaftar,
          kami sudah mengirim tautan untuk mengatur ulang kata sandi. Cek juga
          folder spam ya.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white">Lupa sandi?</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Masukkan email akunmu, kami akan mengirim tautan untuk mengatur ulang
        kata sandi.
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-brand-500/30 bg-brand-600/10 px-4 py-3 text-sm text-brand-300">
          {error}
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
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
          {loading ? "Mengirim..." : "Kirim tautan reset"}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke halaman masuk
      </Link>
    </div>
  );
}
