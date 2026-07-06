export const siteConfig = {
  name: "Atlas Sports Club Malang",
  shortName: "Atlas Sports Club",
  tagline: "Elite Fitness Center Malang",
  description:
    "Atlas Sports Club Malang — pusat kebugaran premium di Malang dengan standar internasional. Pilih paket keanggotaan, booking kelas, dan kelola langgananmu dalam satu platform.",
  address: "Kota Malang, Jawa Timur",
  email: "info@atlassportsclub.id",
  phone: "0341 - 556125",
  whatsapp: "085122288874",
  instagram: "atlassportsmalang",
  instagramUrl: "https://instagram.com/atlassportsmalang",
  whatsappUrl: "https://wa.me/6285122288874",
  phoneUrl: "tel:+62341556125",
  hours: "05:00 — 23:00 WIB",
  establishedYear: "2016",
};

/**
 * Feature flags berdasarkan environment variable.
 * Aplikasi tetap bisa dijalankan & menampilkan UI walau integrasi belum diisi
 * (menggunakan data contoh untuk keperluan demo/tampilan).
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const isSupabaseAdminConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const isMidtransConfigured = Boolean(process.env.MIDTRANS_SERVER_KEY);

export const isResendConfigured = Boolean(process.env.RESEND_API_KEY);
