import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createSnapClient, buildTransactionParameter } from "@/lib/midtrans";
import type { PackageRow } from "@/lib/types";

/**
 * Checkout paket membership.
 * Alur: autentikasi -> ambil paket dari Supabase -> catat transaksi (pending)
 * -> buat transaksi Midtrans (bila dikonfigurasi) -> kembalikan redirectUrl.
 */
export async function POST(request: Request) {
  let body: { packageId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Body request tidak valid." },
      { status: 400 },
    );
  }

  if (!body.packageId) {
    return NextResponse.json(
      { message: "Paket belum dipilih." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      {
        message:
          "Supabase belum dikonfigurasi. Checkout membutuhkan koneksi database.",
      },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { message: "Silakan masuk dulu." },
      { status: 401 },
    );
  }

  const { data: pkg } = await supabase
    .from("packages")
    .select("*")
    .eq("id", body.packageId)
    .eq("is_active", true)
    .maybeSingle();

  if (!pkg) {
    return NextResponse.json(
      { message: "Paket tidak ditemukan." },
      { status: 404 },
    );
  }
  const paket = pkg as PackageRow;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama")
    .eq("id", user.id)
    .maybeSingle();

  const orderId = `ATL-${Date.now()}`;

  // Catat transaksi sebagai pending sebelum ke payment gateway.
  const { error: insertError } = await supabase.from("transactions").insert({
    user_id: user.id,
    package_id: paket.id,
    order_id: orderId,
    jumlah: paket.harga,
    status: "pending",
  });
  if (insertError) {
    console.error("[checkout] Gagal mencatat transaksi:", insertError);
    return NextResponse.json(
      { message: "Gagal mencatat transaksi." },
      { status: 500 },
    );
  }

  const snap = createSnapClient();

  // Mode demo: Midtrans belum dikonfigurasi. Transaksi tetap tercatat sebagai
  // pending sehingga admin bisa menandainya lunas secara manual.
  if (!snap) {
    return NextResponse.json({
      demo: true,
      orderId,
      message:
        "Mode demo: Midtrans belum dikonfigurasi. Transaksi tercatat sebagai 'pending' — admin dapat menandainya lunas dari panel Transaksi.",
    });
  }

  const parameter = buildTransactionParameter({
    orderId,
    amount: paket.harga,
    planName: paket.nama,
    customer: {
      name: profile?.nama ?? "Anggota Gym Atlas",
      email: user.email ?? "member@gymatlas.id",
    },
  });

  try {
    const transaction = await snap.createTransaction(parameter);
    await supabase
      .from("transactions")
      .update({ midtrans_token: transaction.token })
      .eq("order_id", orderId);

    return NextResponse.json({
      orderId,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error("[checkout] Gagal membuat transaksi Midtrans:", error);
    await supabase
      .from("transactions")
      .update({ status: "failed" })
      .eq("order_id", orderId);
    return NextResponse.json(
      { message: "Gagal membuat transaksi pembayaran." },
      { status: 500 },
    );
  }
}
