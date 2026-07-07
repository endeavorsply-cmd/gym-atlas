// Tipe baris (row) sesuai skema tabel Supabase.

export type ClassRow = {
  id: string;
  nama: string;
  trainer: string | null;
  hari: string | null;
  jam: string | null;
  kapasitas: number | null;
  durasi: number | null;
  deskripsi: string | null;
  level: string | null;
  kategori: string | null;
  is_active: boolean | null;
  trainer_id: string | null;
};

export type PackageRow = {
  id: string;
  nama: string;
  deskripsi: string | null;
  harga: number;
  durasi_hari: number;
  fitur: string[] | null;
  is_popular: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
};

export type ProfileRow = {
  id: string;
  nama: string;
  no_hp: string | null;
  foto: string | null;
  role: string | null;
  checkin_code: string | null;
  created_at: string | null;
};

export type BookingRow = {
  id: string;
  user_id: string | null;
  class_id: string | null;
  tanggal: string;
  status: string | null;
  created_at: string | null;
};

export type SubscriptionRow = {
  id: string;
  user_id: string | null;
  package_id: string | null;
  status: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  created_at: string | null;
};

export type TransactionRow = {
  id: string;
  user_id: string | null;
  subscription_id: string | null;
  package_id: string | null;
  order_id: string;
  jumlah: number;
  status: string | null;
  metode_bayar: string | null;
  midtrans_token: string | null;
  paid_at: string | null;
  created_at: string | null;
};

// Tipe gabungan untuk tampilan.
export type BookingView = BookingRow & {
  className: string;
  trainer: string | null;
  jam: string | null;
};

export type TransactionView = TransactionRow & {
  packageName: string | null;
  memberName: string | null;
};

export type PromoRow = {
  id: string;
  judul: string;
  deskripsi: string | null;
  gambar_url: string;
  link_url: string | null;
  is_active: boolean | null;
  urutan: number | null;
  created_at: string | null;
};
