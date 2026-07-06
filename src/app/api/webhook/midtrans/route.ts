import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendPaymentConfirmation } from "@/lib/email";

type MidtransNotification = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  transaction_status?: string;
  fraud_status?: string;
  signature_key?: string;
  payment_type?: string;
  customer_details?: { email?: string; first_name?: string };
};

function resolveStatus(notif: MidtransNotification): string {
  const status = notif.transaction_status;
  if (status === "capture") {
    return notif.fraud_status === "accept" ? "paid" : "pending";
  }
  if (status === "settlement") return "paid";
  if (status === "pending") return "pending";
  if (status === "deny" || status === "cancel" || status === "expire") {
    return "failed";
  }
  return "pending";
}

/** Verifikasi signature Midtrans: sha512(order_id + status_code + gross_amount + serverKey). */
function isValidSignature(notif: MidtransNotification): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey || !notif.signature_key) return true;
  const payload = `${notif.order_id ?? ""}${notif.status_code ?? ""}${
    notif.gross_amount ?? ""
  }${serverKey}`;
  const expected = createHash("sha512").update(payload).digest("hex");
  return expected === notif.signature_key;
}

type TxRow = {
  jumlah: number | null;
  user_id: string | null;
  packages: { nama: string | null } | { nama: string | null }[] | null;
};

export async function POST(request: Request) {
  let notif: MidtransNotification;
  try {
    notif = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Payload tidak valid." },
      { status: 400 },
    );
  }

  if (!isValidSignature(notif)) {
    return NextResponse.json(
      { message: "Signature tidak valid." },
      { status: 403 },
    );
  }

  const status = resolveStatus(notif);
  const orderId = notif.order_id ?? "unknown";

  const admin = createAdminClient();
  if (admin) {
    if (notif.payment_type) {
      await admin
        .from("transactions")
        .update({ metode_bayar: notif.payment_type })
        .eq("order_id", orderId);
    }

    const { error } = await admin.rpc("settle_transaction", {
      p_order_id: orderId,
      p_status: status,
    });
    if (error) {
      console.error("[webhook] settle_transaction gagal:", error);
    }

    // Kirim email konfirmasi bila pembayaran lunas, dengan detail akurat.
    if (status === "paid") {
      let email = notif.customer_details?.email ?? "";
      let name = notif.customer_details?.first_name ?? "Anggota";
      let planName = "Membership";
      let amount = Number(notif.gross_amount ?? 0);

      const { data: tx } = await admin
        .from("transactions")
        .select("jumlah, user_id, packages(nama)")
        .eq("order_id", orderId)
        .maybeSingle();

      const row = tx as TxRow | null;
      if (row) {
        const pkg = Array.isArray(row.packages) ? row.packages[0] : row.packages;
        if (pkg?.nama) planName = pkg.nama;
        if (typeof row.jumlah === "number") amount = row.jumlah;
        if (row.user_id) {
          const { data: prof } = await admin
            .from("profiles")
            .select("nama")
            .eq("id", row.user_id)
            .maybeSingle();
          if (prof?.nama) name = prof.nama;
          if (!email) {
            const { data: au } = await admin.auth.admin.getUserById(row.user_id);
            email = au?.user?.email ?? "";
          }
        }
      }

      if (email) {
        await sendPaymentConfirmation({
          to: email,
          name,
          planName,
          amount,
          orderId,
        });
      }
    }
  }

  return NextResponse.json({ received: true, orderId, status });
}
