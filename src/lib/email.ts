import { Resend } from "resend";
import { siteConfig } from "@/lib/config";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// Alamat pengirim. Untuk produksi, verifikasi domain di Resend lalu isi
// EMAIL_FROM, misal: "Atlas Sports Club <no-reply@domainmu.com>".
// Default memakai domain uji Resend (hanya bisa kirim ke email akunmu sendiri).
const FROM =
  process.env.EMAIL_FROM || `${siteConfig.name} <onboarding@resend.dev>`;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "";

type SendResult =
  | { skipped: true }
  | { skipped: false; error: unknown }
  | { skipped: false; data: unknown };

async function sendMail(
  to: string,
  subject: string,
  html: string,
  logTag: string,
): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    console.info(
      `[email] Resend belum dikonfigurasi - lewati ${logTag} ke ${to}.`,
    );
    return { skipped: true };
  }
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
  if (error) {
    console.error(`[email] Gagal mengirim ${logTag}:`, error);
    return { skipped: false, error };
  }
  return { skipped: false, data };
}

function layout(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
    <div style="background:#0d0d0d;padding:20px 24px;border-radius:12px 12px 0 0;">
      <h1 style="color:#f21b28;margin:0;font-size:20px;">${siteConfig.name}</h1>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
      <h2 style="margin-top:0;font-size:18px;">${title}</h2>
      ${bodyHtml}
      <p style="color:#888;font-size:12px;margin-top:24px;">
        ${siteConfig.name} - ${siteConfig.address}<br/>
        <a href="${siteConfig.whatsappUrl}" style="color:#888;">Hubungi kami via WhatsApp</a>
      </p>
    </div>
  </div>`;
}

function button(href: string, label: string): string {
  if (!href) return "";
  return `<p><a href="${href}" style="display:inline-block;background:#f21b28;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold;">${label}</a></p>`;
}

export type PaymentEmailInput = {
  to: string;
  name: string;
  planName: string;
  amount: number;
  orderId: string;
};

export async function sendPaymentConfirmation(input: PaymentEmailInput) {
  const html = layout(
    `Halo ${input.name},`,
    `<p>Terima kasih! Pembayaran untuk paket <strong>${input.planName}</strong> telah kami terima dan keanggotaanmu sudah aktif.</p>
     <p><strong>Order ID:</strong> ${input.orderId}<br/>
     <strong>Total:</strong> Rp${input.amount.toLocaleString("id-ID")}</p>
     ${button(SITE ? `${SITE}/dashboard` : "", "Buka Dashboard")}
     <p>Sampai jumpa di tempat latihan!</p>`,
  );
  return sendMail(
    input.to,
    `Pembayaran diterima - Membership ${input.planName}`,
    html,
    "konfirmasi pembayaran",
  );
}

export type WelcomeEmailInput = { to: string; name: string };

export async function sendWelcomeEmail(input: WelcomeEmailInput) {
  const html = layout(
    `Selamat datang, ${input.name}!`,
    `<p>Akunmu di <strong>${siteConfig.name}</strong> berhasil dibuat. Sekarang kamu bisa:</p>
     <ul>
       <li>Memilih paket keanggotaan</li>
       <li>Booking kelas favoritmu</li>
       <li>Memantau progres latihan &amp; check-in</li>
     </ul>
     ${button(SITE ? `${SITE}/pricing` : "", "Lihat Paket Membership")}
     <p>Ayo mulai perjalanan kebugaranmu bersama kami!</p>`,
  );
  return sendMail(
    input.to,
    `Selamat datang di ${siteConfig.name}`,
    html,
    "email selamat datang",
  );
}

export type ExpiryEmailInput = {
  to: string;
  name: string;
  planName: string;
  endDate: string;
};

export async function sendExpiryReminder(input: ExpiryEmailInput) {
  const html = layout(
    `Halo ${input.name},`,
    `<p>Membership <strong>${input.planName}</strong> kamu akan <strong>berakhir pada ${input.endDate}</strong> (3 hari lagi).</p>
     <p>Perpanjang sekarang agar akses ke kelas &amp; fasilitas tidak terputus.</p>
     ${button(SITE ? `${SITE}/subscription` : "", "Perpanjang Sekarang")}
     <p>Sampai jumpa kembali di tempat latihan!</p>`,
  );
  return sendMail(
    input.to,
    `Pengingat: membership kamu berakhir dalam 3 hari`,
    html,
    "pengingat kedaluwarsa",
  );
}
