import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendExpiryReminder } from "@/lib/email";

// Kembalikan tanggal (YYYY-MM-DD) di zona WIB (UTC+7), digeser sejumlah hari.
function jakartaDatePlus(days: number): string {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  wib.setUTCDate(wib.getUTCDate() + days);
  return wib.toISOString().slice(0, 10);
}

type SubRow = {
  id: string;
  user_id: string;
  tanggal_selesai: string;
  packages: { nama: string | null } | { nama: string | null }[] | null;
};

async function handle(request: Request) {
  // Proteksi: bila CRON_SECRET diset, wajib Authorization: Bearer <secret>.
  // Vercel Cron otomatis menyertakan header ini bila env CRON_SECRET ada.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase admin belum dikonfigurasi." },
      { status: 500 },
    );
  }

  const target = jakartaDatePlus(3);
  const nextDay = jakartaDatePlus(4);

  const { data, error } = await admin
    .from("subscriptions")
    .select("id, user_id, tanggal_selesai, packages(nama)")
    .eq("status", "active")
    .gte("tanggal_selesai", target)
    .lt("tanggal_selesai", nextDay);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as SubRow[];
  let sent = 0;

  for (const sub of rows) {
    const { data: profile } = await admin
      .from("profiles")
      .select("nama")
      .eq("id", sub.user_id)
      .maybeSingle();

    const { data: authData } = await admin.auth.admin.getUserById(sub.user_id);
    const email = authData?.user?.email;
    if (!email) continue;

    const pkg = Array.isArray(sub.packages) ? sub.packages[0] : sub.packages;
    const planName = pkg?.nama ?? "Membership";

    await sendExpiryReminder({
      to: email,
      name: profile?.nama ?? "Anggota",
      planName,
      endDate: sub.tanggal_selesai,
    });
    sent += 1;
  }

  return NextResponse.json({ ok: true, checked: rows.length, sent });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
