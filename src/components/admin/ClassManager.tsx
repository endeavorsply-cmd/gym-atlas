"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { formatJam } from "@/lib/format";
import type { ClassRow } from "@/lib/types";

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

type TrainerOption = { id: string; nama: string };

type FormState = {
  nama: string;
  kategori: string;
  level: string;
  hari: string;
  jam: string;
  durasi: string;
  kapasitas: string;
  trainer: string;
  trainer_id: string;
  deskripsi: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  nama: "",
  kategori: "",
  level: "",
  hari: "Senin",
  jam: "",
  durasi: "",
  kapasitas: "20",
  trainer: "",
  trainer_id: "",
  deskripsi: "",
  is_active: true,
};

export default function ClassManager({
  initial,
  trainers,
}: {
  initial: ClassRow[];
  trainers: TrainerOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  }

  function startEdit(c: ClassRow) {
    setEditingId(c.id);
    setError(null);
    setForm({
      nama: c.nama ?? "",
      kategori: c.kategori ?? "",
      level: c.level ?? "",
      hari: c.hari ?? "Senin",
      jam: (c.jam ?? "").slice(0, 5),
      durasi: c.durasi != null ? String(c.durasi) : "",
      kapasitas: c.kapasitas != null ? String(c.kapasitas) : "20",
      trainer: c.trainer ?? "",
      trainer_id: c.trainer_id ?? "",
      deskripsi: c.deskripsi ?? "",
      is_active: c.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nama.trim()) {
      setError("Nama kelas wajib diisi.");
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi (.env.local).");
      return;
    }
    const payload = {
      nama: form.nama.trim(),
      kategori: form.kategori.trim() || null,
      level: form.level.trim() || null,
      hari: form.hari || null,
      jam: form.jam || null,
      durasi: form.durasi ? Number(form.durasi) : null,
      kapasitas: form.kapasitas ? Number(form.kapasitas) : null,
      trainer: form.trainer.trim() || null,
      trainer_id: form.trainer_id || null,
      deskripsi: form.deskripsi.trim() || null,
      is_active: form.is_active,
    };

    setSaving(true);
    const query = editingId
      ? supabase.from("classes").update(payload).eq("id", editingId)
      : supabase.from("classes").insert(payload);
    const { error: err } = await query;
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    resetForm();
    router.refresh();
  }

  async function toggleActive(c: ClassRow) {
    const supabase = createClient();
    if (!supabase) return;
    setBusyId(c.id);
    await supabase
      .from("classes")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    setBusyId(null);
    router.refresh();
  }

  async function remove(c: ClassRow) {
    if (!window.confirm(`Hapus kelas "${c.nama}"? Tindakan ini permanen.`)) {
      return;
    }
    const supabase = createClient();
    if (!supabase) return;
    setBusyId(c.id);
    const { error: err } = await supabase
      .from("classes")
      .delete()
      .eq("id", c.id);
    setBusyId(null);
    if (err) {
      window.alert(err.message);
      return;
    }
    if (editingId === c.id) resetForm();
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Jadwal Kelas
        </h1>
        <p className="mt-1 text-zinc-400">
          Tambah, ubah, dan atur jadwal kelas yang tampil di website.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-2xl border border-white/8 bg-ink-800 p-6 md:grid-cols-2"
      >
        <div className="flex items-center justify-between md:col-span-2">
          <h2 className="font-serif text-lg font-bold text-white">
            {editingId ? "Ubah kelas" : "Tambah kelas baru"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" /> Batal edit
            </button>
          )}
        </div>

        <div>
          <label className={labelClass}>Nama kelas</label>
          <input
            value={form.nama}
            onChange={(e) => set("nama", e.target.value)}
            placeholder="Body Combat"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Kategori</label>
          <input
            value={form.kategori}
            onChange={(e) => set("kategori", e.target.value)}
            placeholder="Cardio"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Hari</label>
          <select
            value={form.hari}
            onChange={(e) => set("hari", e.target.value)}
            className={inputClass}
          >
            {HARI.map((h) => (
              <option key={h} value={h} className="bg-ink-900">
                {h}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Jam</label>
          <input
            type="time"
            value={form.jam}
            onChange={(e) => set("jam", e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>

        <div>
          <label className={labelClass}>Durasi (menit)</label>
          <input
            type="number"
            min="0"
            value={form.durasi}
            onChange={(e) => set("durasi", e.target.value)}
            placeholder="55"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Kapasitas</label>
          <input
            type="number"
            min="1"
            value={form.kapasitas}
            onChange={(e) => set("kapasitas", e.target.value)}
            placeholder="20"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Level</label>
          <input
            value={form.level}
            onChange={(e) => set("level", e.target.value)}
            placeholder="Semua / Pemula / Menengah / Lanjutan"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Nama trainer (tampil di kartu)</label>
          <input
            value={form.trainer}
            onChange={(e) => set("trainer", e.target.value)}
            placeholder="Dimas Prakoso"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>
            Akun trainer (untuk dashboard trainer)
          </label>
          <select
            value={form.trainer_id}
            onChange={(e) => set("trainer_id", e.target.value)}
            className={inputClass}
          >
            <option value="" className="bg-ink-900">
              - Tidak ditautkan -
            </option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id} className="bg-ink-900">
                {t.nama}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Tautkan ke akun trainer agar kelas ini muncul di dashboard & absensi
            trainer tersebut.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Deskripsi</label>
          <textarea
            value={form.deskripsi}
            onChange={(e) => set("deskripsi", e.target.value)}
            rows={2}
            placeholder="Keterangan singkat kelas..."
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-300 md:col-span-2">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-ink-950 text-brand-600"
          />
          Aktif (tampil di website & bisa dibooking)
        </label>

        {error && (
          <p className="rounded-lg border border-brand-500/30 bg-brand-600/10 px-3 py-2 text-sm text-brand-300 md:col-span-2">
            {error}
          </p>
        )}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-700/30 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingId ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {saving
              ? "Menyimpan..."
              : editingId
                ? "Simpan Perubahan"
                : "Tambah Kelas"}
          </button>
        </div>
      </form>

      <div>
        <h2 className="mb-4 font-serif text-lg font-bold text-white">
          Daftar kelas ({initial.length})
        </h2>
        {initial.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-10 text-center text-zinc-500">
            Belum ada kelas. Tambahkan kelas pertama di atas.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/8 bg-ink-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-ink-700 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Kelas</th>
                  <th className="px-5 py-3 font-semibold">Jadwal</th>
                  <th className="px-5 py-3 font-semibold">Trainer</th>
                  <th className="px-5 py-3 font-semibold">Kapasitas</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {initial.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{c.nama}</div>
                      <div className="text-xs text-zinc-500">
                        {c.kategori ?? "-"}
                        {c.level ? ` - ${c.level}` : ""}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {c.hari ?? "-"}
                      {c.jam ? `, ${formatJam(c.jam)}` : ""}
                      {c.durasi ? ` (${c.durasi} mnt)` : ""}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {c.trainer ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {c.kapasitas ?? "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase ${
                          c.is_active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-zinc-500"
                        }`}
                      >
                        {c.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(c)}
                          disabled={busyId === c.id}
                          title={c.is_active ? "Sembunyikan" : "Tampilkan"}
                          className="rounded-lg border border-white/10 p-2 text-zinc-300 transition-colors hover:bg-white/5 disabled:opacity-60"
                        >
                          {busyId === c.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : c.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          title="Ubah"
                          className="rounded-lg border border-white/10 p-2 text-zinc-300 transition-colors hover:bg-white/5"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(c)}
                          disabled={busyId === c.id}
                          title="Hapus"
                          className="rounded-lg border border-brand-500/30 p-2 text-brand-400 transition-colors hover:bg-brand-600/10 disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
