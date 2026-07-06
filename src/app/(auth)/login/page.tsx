"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    const res = await signIn(email.trim(), password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    const dest =
      res.role === "admin"
        ? "/admin"
        : res.role === "trainer"
          ? "/trainer"
          : searchParams.get("redirect") || "/dashboard";
    router.push(dest);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-ink-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-white">
        Masuk ke akunmu
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-500 hover:text-brand-400"
        >
          Daftar sekarang
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-zinc-400">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-ink-950 text-brand-600"
            />{" "}
            Ingat saya
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-brand-500 hover:text-brand-400"
          >
            Lupa sandi?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-700/30 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}