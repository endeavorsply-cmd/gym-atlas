"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { formatTanggal } from "@/lib/format";
import type { ProfileRow } from "@/lib/types";

const ROLES = ["member", "trainer", "admin"];

function RoleSelect({ member }: { member: ProfileRow }) {
  const router = useRouter();
  const [role, setRole] = useState(member.role ?? "member");
  const [saving, setSaving] = useState(false);

  async function change(next: string) {
    const prev = role;
    setRole(next);
    setSaving(true);
    const supabase = createClient();
    if (!supabase) {
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ role: next })
      .eq("id", member.id);
    setSaving(false);
    if (error) {
      window.alert(error.message);
      setRole(prev);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => change(e.target.value)}
        disabled={saving}
        className="rounded-lg border border-white/10 bg-ink-900 px-2 py-1 text-sm capitalize text-white outline-none focus:border-brand-500"
      >
        {ROLES.map((r) => (
          <option key={r} value={r} className="bg-ink-900">
            {r}
          </option>
        ))}
      </select>
      {saving && <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />}
    </div>
  );
}

export default function MemberManager({ initial }: { initial: ProfileRow[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          Anggota
        </h1>
        <p className="mt-1 text-zinc-400">
          Kelola anggota dan ubah role mereka.
        </p>
      </div>

      {initial.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-ink-800 p-10 text-center text-zinc-500">
          Belum ada anggota, atau kamu tidak punya akses (butuh policy admin).
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-700 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">No. HP</th>
                <th className="px-5 py-3 font-semibold">Bergabung</th>
                <th className="px-5 py-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {initial.map((m) => (
                <tr key={m.id} className="hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white">
                        {(m.nama || "?").charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium text-white">{m.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-400">{m.no_hp ?? "-"}</td>
                  <td className="px-5 py-4 text-zinc-400">
                    {formatTanggal((m.created_at ?? "").slice(0, 10) || null)}
                  </td>
                  <td className="px-5 py-4">
                    <RoleSelect member={m} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
