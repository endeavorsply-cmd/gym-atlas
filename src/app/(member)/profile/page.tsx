"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth, initials } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, ready, updateProfile, signOut } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [ready, user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    const { error } = await updateProfile(name.trim(), phone.trim());
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const letter = name ? initials(name) : "A";

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 [color-scheme:dark] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            Profil
          </h1>
          <p className="mt-1 text-zinc-400">
            Perbarui data akun dan preferensimu.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-500"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>

      <div className="rounded-xl border border-white/8 bg-ink-800 p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 font-serif text-2xl font-bold text-white">
            {letter}
          </span>
          <div>
            <p className="text-lg font-semibold text-white">{name || "Tamu"}</p>
            <p className="text-sm text-zinc-500">
              {user?.email || "Belum masuk"}
              {user?.role ? ` · ${user.role}` : ""}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-brand-500/30 bg-brand-600/10 px-4 py-3 text-sm text-brand-300">
            {error}
          </div>
        )}

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Nama lengkap
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-zinc-500 outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Nomor telepon
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+62 812-3456-7890"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Tanggal lahir
            </label>
            <input type="date" className={inputClass} />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/30 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            {saved && (
              <span className="text-sm font-medium text-emerald-400">
                Tersimpan ✓
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
