"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Trash2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";
import type { PromoRow } from "@/lib/types";

export default function PromoManager({ initial }: { initial: PromoRow[] }) {
  const router = useRouter();
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!judul.trim()) {
      setError("Judul promo wajib diisi.");
      return;
    }
    if (!file) {
      setError("Pilih foto promo terlebih dahulu.");
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi (.env.local).");
      return;
    }

    setSaving(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("promos")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("promos").getPublicUrl(path);

      const { error: insErr } = await supabase.from("promos").insert({
        judul: judul.trim(),
        deskripsi: deskripsi.trim() || null,
        link_url: linkUrl.trim() || null,
        gambar_url: publicUrl,
        is_active: true,
        urutan: initial.length,
      });
      if (insErr) throw insErr;

      setJudul("");
      setDeskripsi("");
      setLinkUrl("");
      setFile(null);
      setPreview(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah promo.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: PromoRow) {
    const supabase = createClient();
    if (!supabase) return;
    setBusyId(p.id);
    await supabase
      .from("promos")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    setBusyId(null);
    router.refresh();
  }

  async function remove(p: PromoRow) {
    if (!window.confirm(`Hapus promo "${p.judul}"?`)) return;
    const supabase = createClient();
    if (!supabase) return;
    setBusyId(p.id);
    await supabase.from("promos").delete().eq("id", p.id);
    setBusyId(null);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Promo
        </h1>
        <p className="mt-1 text-zinc-400">
          Unggah foto promo untuk ditampilkan di halaman utama website.
        </p>
      </div>

      {/* Form upload */}
      <form
        onSubmit={handleUpload}
        className="grid gap-5 rounded-2xl border border-white/8 bg-ink-800 p-6 md:grid-cols-2"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Judul promo
            </label>
            <input
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Diskon 30% Member Baru"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Deskripsi (opsional)
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={3}
              placeholder="Keterangan singkat promo..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Link tujuan (opsional)
            </label>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://wa.me/6285122288874"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Foto promo
          </label>
          <label className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed border-white/15 bg-ink-950 p-4 text-center transition-colors hover:border-brand-500/50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Pratinjau"
                className="max-h-48 w-full rounded object-cover"
              />
            ) : (
              <>
                <Upload className="h-6 w-6 text-zinc-500" />
                <span className="text-sm text-zinc-500">
                  Klik untuk memilih foto
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onPick}
              className="hidden"
            />
          </label>

          {error && (
            <p className="mt-3 rounded-lg border border-brand-500/30 bg-brand-600/10 px-3 py-2 text-sm text-brand-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-700/30 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {saving ? "Mengunggah..." : "Unggah Promo"}
          </button>
        </div>
      </form>

      {/* Daftar promo */}
      <div>
        <h2 className="mb-4 font-serif text-lg font-bold text-white">
          Daftar promo ({initial.length})
        </h2>

        {initial.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-10 text-center text-zinc-500">
            Belum ada promo. Unggah foto pertama di atas.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initial.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-white/8 bg-ink-800"
              >
                <div className="aspect-[4/3] overflow-hidden bg-ink-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.gambar_url}
                    alt={p.judul}
                    className={`h-full w-full object-cover ${
                      p.is_active ? "" : "opacity-40 grayscale"
                    }`}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white">{p.judul}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase ${
                        p.is_active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-white/5 text-zinc-500"
                      }`}
                    >
                      {p.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  {p.deskripsi && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                      {p.deskripsi}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(p)}
                      disabled={busyId === p.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/5 disabled:opacity-60"
                    >
                      {busyId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : p.is_active ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      {p.is_active ? "Sembunyikan" : "Tampilkan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p)}
                      disabled={busyId === p.id}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-brand-500/30 px-3 py-2 text-xs font-semibold text-brand-400 transition-colors hover:bg-brand-600/10 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
