"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function TrainerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nama, setNama] = useState("");
  const [spesialis, setSpesialis] = useState("");
  const [pengalaman, setPengalaman] = useState("");
  const [foto, setFoto] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase belum dikonfigurasi.");
        setLoading(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("nama, spesialis, pengalaman, foto, bio")
        .eq("id", user.id)
        .maybeSingle();
      if (active && data) {
        setNama(data.nama ?? "");
        setSpesialis(data.spesialis ?? "");
        setPengalaman(data.pengalaman ?? "");
        setFoto(data.foto ?? "");
        setBio(data.bio ?? "");
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("Sesi tidak ditemukan.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        nama: nama.trim(),
        spesialis: spesialis.trim() || null,
        pengalaman: pengalaman.trim() || null,
        foto: foto.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuat profil...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Profil Trainer
        </h1>
        <p className="mt-1 text-zinc-400">
          Data ini tampil di halaman Trainer publik.
        </p>
      </div>

      <div className="rounded-xl border border-white/8 bg-ink-800 p-6">
        <div className="flex items-center gap-4">
          {foto ? (
            <img
              src={foto}
              alt={nama}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 font-serif text-2xl font-bold text-white">
              {(nama || "T").charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="text-lg font-semibold text-white">
              {nama || "Trainer"}
            </p>
            <p className="text-sm text-zinc-500">
              {spesialis || "Spesialisasi belum diisi"}
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
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Spesialisasi
            </label>
            <input
              value={spesialis}
              onChange={(e) => setSpesialis(e.target.value)}
              placeholder="HIIT & Body Combat"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Pengalaman
            </label>
            <input
              value={pengalaman}
              onChange={(e) => setPengalaman(e.target.value)}
              placeholder="8 tahun"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              URL Foto
            </label>
            <input
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Ceritakan pengalaman dan keahlianmu..."
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-700/30 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            {saved && (
              <span className="text-sm font-medium text-emerald-400">
                Tersimpan
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}