# Gym Atlas — Platform Keanggotaan Gym

Aplikasi web keanggotaan gym modern (Next.js 15 App Router + Supabase + Midtrans):
pilih paket, booking kelas, check-in kehadiran, dan kelola langganan dalam satu tempat.
Dilengkapi panel admin untuk mengelola anggota dan transaksi.

## Fitur

- **Landing page** publik: hero, fitur, kelas populer, harga, FAQ.
- **Autentikasi** (daftar / masuk) via Supabase Auth.
- **Dashboard member**: statistik, booking mendatang, rekomendasi kelas, **check-in harian**.
- **Booking kelas** dengan kuota real-time (RPC atomik anti double-booking).
- **Langganan & pembayaran** via Midtrans (dengan mode demo bila belum dikonfigurasi).
- **Panel admin**: ringkasan, kelola anggota & role, konfirmasi transaksi manual.
- **Halaman Trainer** dan **Kalkulator BMI** publik.

## Prasyarat

- Node.js 18.18+ (disarankan 20+).
- Akun [Supabase](https://supabase.com) (wajib) — database & auth.
- Akun [Midtrans](https://midtrans.com) (opsional) — pembayaran.
- Akun [Resend](https://resend.com) (opsional) — email konfirmasi.

## Cara menjalankan

### 1. Install dependency

```bash
npm install
```

### 2. Siapkan database Supabase

Buka **Supabase Dashboard → SQL Editor**, lalu jalankan seluruh isi file:

```
supabase/schema.sql
```

Skrip ini membuat semua tabel, Row Level Security, fungsi RPC
(`book_class`, `class_slots`, `check_in`, `confirm_transaction`, `settle_transaction`),
trigger pembuatan profil otomatis, serta seed data paket & kelas contoh.

### 3. Konfigurasi environment

Salin `.env.example` menjadi `.env.local` dan isi nilainya:

```bash
cp .env.example .env.local
```

Minimal isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(ditemukan di Supabase → Project Settings → API).

> Tanpa konfigurasi Supabase, aplikasi tetap berjalan dalam "mode demo"
> (UI tampil, namun fitur yang butuh database tidak aktif).

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Menjadikan akun sebagai Admin

Setelah mendaftar, jalankan di SQL Editor (ganti dengan UUID akunmu):

```sql
update public.profiles set role = 'admin' where id = '<user-uuid>';
```

UUID user bisa dilihat di **Supabase → Authentication → Users**. Setelah itu,
login akan diarahkan ke `/admin`.

## Webhook pembayaran (Midtrans)

Arahkan **Payment Notification URL** Midtrans ke:

```
https://<domain-kamu>/api/webhook/midtrans
```

Webhook memverifikasi signature, memperbarui status transaksi, dan otomatis
mengaktifkan langganan saat pembayaran lunas.

## Struktur singkat

```
src/
  app/
    (public)/    Landing, harga, trainer, kalkulator BMI
    (auth)/      Login & register
    (member)/    Dashboard, kelas, booking, langganan, profil
    (admin)/     Ringkasan, anggota, transaksi
    api/         checkout & webhook Midtrans
  components/    Komponen UI
  lib/           Supabase client, query, format, midtrans, email
supabase/
  schema.sql     Skema database + RLS + RPC + seed
```

## Teknologi

- Next.js 15 (App Router, Server Components)
- Supabase (PostgreSQL, Auth, RLS, RPC)
- Tailwind CSS v4
- Midtrans Snap, Resend, lucide-react
