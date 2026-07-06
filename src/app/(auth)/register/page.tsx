"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { siteConfig } from "@/lib/config";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    setLoading(true);
    setError(null);
    const res = await signUp(name.trim(), email.trim(), password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    void fetch("/api/notify/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), name: name.trim() }),
    }).catch(() => {});

    if (res.needsConfirmation) {
      setConfirm(true);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-ink-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  if (confirm) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-serif text-2xl font-bold text-white">
          Cek email kamu
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Kami mengirim tautan konfirmasi ke <strong>{email}</strong>. Klik
          tautan itu untuk mengaktifkan akun, lalu masuk.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white"
        >
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white">
        Buat akun {siteConfig.shortName}
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-500 hover:text-brand-400"
        >
          Masuk di sini
        </Link>
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-brand-500/30 bg-brand-600/10 px-4 py-3 text-sm text-brand-300">
          {error}
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Nama lengkap
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              className={inputClass}
            />
          </div>
        </div>

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

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Kata sandi
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
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
          {loading ? "Memproses..." : "Buat Akun"}
        </button>
        <p className="text-center text-xs text-zinc-500">
          Dengan mendaftar, kamu menyetujui Syarat & Ketentuan{" "}
          {siteConfig.shortName}.
        </p>
      </form>
    </div>
  );
}

