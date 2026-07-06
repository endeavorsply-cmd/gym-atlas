-- ============================================================================
-- Gym Atlas — Skema database Supabase (PostgreSQL)
-- Jalankan seluruh file ini di Supabase SQL Editor (sekali jalan).
-- Aman dijalankan ulang (idempotent) berkat IF NOT EXISTS / OR REPLACE.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- TABEL
-- ---------------------------------------------------------------------------

-- Profil user (1:1 dengan auth.users)
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nama       text not null default 'Anggota',
  no_hp      text,
  foto       text,
  role       text not null default 'member' check (role in ('member', 'trainer', 'admin')),
  created_at timestamptz not null default now()
);

-- Paket membership
create table if not exists public.packages (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  deskripsi   text,
  harga       integer not null,
  durasi_hari integer not null default 30,
  fitur       text[] default '{}',
  is_popular  boolean default false,
  is_active   boolean default true,
  created_at  timestamptz not null default now()
);

-- Kelas / jadwal latihan
create table if not exists public.classes (
  id        uuid primary key default gen_random_uuid(),
  nama      text not null,
  trainer   text,
  hari      text,
  jam       time,
  kapasitas integer default 20,
  durasi    integer,
  deskripsi text,
  level     text,
  kategori  text,
  is_active boolean default true
);

-- Booking kelas
create table if not exists public.bookings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete cascade,
  class_id   uuid references public.classes (id) on delete set null,
  tanggal    date not null,
  status     text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists bookings_user_idx on public.bookings (user_id);
create index if not exists bookings_class_date_idx on public.bookings (class_id, tanggal);

-- Langganan aktif
create table if not exists public.subscriptions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete cascade,
  package_id     uuid references public.packages (id) on delete set null,
  status         text not null default 'active' check (status in ('active', 'expired', 'pending', 'cancelled')),
  tanggal_mulai  date,
  tanggal_selesai date,
  created_at     timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

-- Transaksi pembayaran
create table if not exists public.transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users (id) on delete set null,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  package_id      uuid references public.packages (id) on delete set null,
  order_id        text not null unique,
  jumlah          integer not null,
  status          text not null default 'pending' check (status in ('paid', 'pending', 'failed')),
  metode_bayar    text,
  midtrans_token  text,
  paid_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists transactions_user_idx on public.transactions (user_id);

-- Kehadiran / check-in
create table if not exists public.attendance (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete cascade,
  tanggal    date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, tanggal)
);
create index if not exists attendance_user_idx on public.attendance (user_id);

-- ---------------------------------------------------------------------------
-- FUNGSI BANTU
-- ---------------------------------------------------------------------------

-- Cek apakah user saat ini admin (SECURITY DEFINER agar tidak memicu rekursi RLS).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Buat profil otomatis saat user baru mendaftar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nama)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cegah user biasa mengubah role-nya sendiri (privilege escalation).
create or replace function public.protect_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Hanya cegah perubahan role bila dilakukan oleh USER LOGIN yang BUKAN admin.
  -- Saat dijalankan dari SQL Editor / service role, auth.uid() bernilai NULL
  -- sehingga bootstrap admin pertama lewat SQL tetap bisa dilakukan.
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_role();

-- ---------------------------------------------------------------------------
-- RPC: dipakai aplikasi
-- ---------------------------------------------------------------------------

-- Jumlah slot terisi per kelas untuk tanggal tertentu.
create or replace function public.class_slots(p_tanggal date)
returns table (class_id uuid, terisi bigint)
language sql
security definer
set search_path = public
as $$
  select class_id, count(*)::bigint as terisi
  from public.bookings
  where tanggal = p_tanggal
    and status <> 'cancelled'
    and class_id is not null
  group by class_id;
$$;

-- Booking kelas secara atomik: cek langganan aktif, kelas, duplikat, & kuota.
create or replace function public.book_class(p_class_id uuid, p_tanggal date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_cap integer;
  v_used integer;
begin
  if v_uid is null then
    raise exception 'Harus login untuk booking.';
  end if;

  if not exists (
    select 1 from public.subscriptions
    where user_id = v_uid and status = 'active'
      and (tanggal_selesai is null or tanggal_selesai >= current_date)
  ) then
    raise exception 'Butuh langganan aktif untuk booking kelas.';
  end if;

  select kapasitas into v_cap
  from public.classes
  where id = p_class_id and is_active = true;
  if not found then
    raise exception 'Kelas tidak ditemukan atau tidak aktif.';
  end if;

  if exists (
    select 1 from public.bookings
    where user_id = v_uid and class_id = p_class_id
      and tanggal = p_tanggal and status <> 'cancelled'
  ) then
    raise exception 'Kamu sudah booking kelas ini pada tanggal tersebut.';
  end if;

  if v_cap is not null and v_cap > 0 then
    select count(*) into v_used
    from public.bookings
    where class_id = p_class_id and tanggal = p_tanggal and status <> 'cancelled';
    if v_used >= v_cap then
      raise exception 'Kelas sudah penuh untuk tanggal ini.';
    end if;
  end if;

  insert into public.bookings (user_id, class_id, tanggal, status)
  values (v_uid, p_class_id, p_tanggal, 'upcoming');
end;
$$;

-- Check-in kehadiran (maks 1x per hari, butuh langganan aktif).
create or replace function public.check_in()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Harus login untuk check-in.';
  end if;
  if not exists (
    select 1 from public.subscriptions
    where user_id = v_uid and status = 'active'
      and (tanggal_selesai is null or tanggal_selesai >= current_date)
  ) then
    raise exception 'Butuh langganan aktif untuk check-in.';
  end if;
  insert into public.attendance (user_id, tanggal)
  values (v_uid, current_date)
  on conflict (user_id, tanggal) do nothing;
end;
$$;

-- Selesaikan transaksi (dipakai webhook via service role & admin manual).
-- Saat 'paid': tandai lunas + aktifkan langganan sesuai durasi paket.
create or replace function public.settle_transaction(p_order_id text, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_txn public.transactions;
  v_durasi integer;
  v_sub_id uuid;
begin
  select * into v_txn from public.transactions where order_id = p_order_id;
  if not found then
    return;
  end if;

  update public.transactions
  set status = p_status,
      paid_at = case when p_status = 'paid' then now() else paid_at end
  where id = v_txn.id;

  if p_status = 'paid' and v_txn.subscription_id is null then
    select coalesce(durasi_hari, 30) into v_durasi
    from public.packages where id = v_txn.package_id;
    v_durasi := coalesce(v_durasi, 30);

    insert into public.subscriptions (user_id, package_id, status, tanggal_mulai, tanggal_selesai)
    values (v_txn.user_id, v_txn.package_id, 'active', current_date, current_date + v_durasi)
    returning id into v_sub_id;

    update public.transactions set subscription_id = v_sub_id where id = v_txn.id;
  end if;
end;
$$;

-- Konfirmasi manual oleh admin dari panel transaksi.
create or replace function public.confirm_transaction(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order text;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat mengonfirmasi transaksi.';
  end if;
  select order_id into v_order from public.transactions where id = p_id;
  if v_order is null then
    raise exception 'Transaksi tidak ditemukan.';
  end if;
  perform public.settle_transaction(v_order, 'paid');
end;
$$;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.packages      enable row level security;
alter table public.classes       enable row level security;
alter table public.bookings      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions  enable row level security;
alter table public.attendance    enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert
  with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- packages (publik boleh baca yang aktif)
drop policy if exists packages_select on public.packages;
create policy packages_select on public.packages for select
  using (is_active or public.is_admin());
drop policy if exists packages_admin on public.packages;
create policy packages_admin on public.packages for all
  using (public.is_admin()) with check (public.is_admin());

-- classes (publik boleh baca yang aktif)
drop policy if exists classes_select on public.classes;
create policy classes_select on public.classes for select
  using (is_active or public.is_admin());
drop policy if exists classes_admin on public.classes;
create policy classes_admin on public.classes for all
  using (public.is_admin()) with check (public.is_admin());

-- bookings
drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings for insert
  with check (user_id = auth.uid());
drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings for update
  using (user_id = auth.uid() or public.is_admin());

-- subscriptions (baca sendiri / admin; tulis lewat RPC security definer)
drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists subscriptions_admin on public.subscriptions;
create policy subscriptions_admin on public.subscriptions for all
  using (public.is_admin()) with check (public.is_admin());

-- transactions
drop policy if exists transactions_select on public.transactions;
create policy transactions_select on public.transactions for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists transactions_insert on public.transactions;
create policy transactions_insert on public.transactions for insert
  with check (user_id = auth.uid());
drop policy if exists transactions_admin on public.transactions;
create policy transactions_admin on public.transactions for update
  using (public.is_admin()) with check (public.is_admin());

-- attendance
drop policy if exists attendance_select on public.attendance;
create policy attendance_select on public.attendance for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists attendance_insert on public.attendance;
create policy attendance_insert on public.attendance for insert
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- GRANTS untuk RPC
-- ---------------------------------------------------------------------------
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.class_slots(date) to anon, authenticated;
grant execute on function public.book_class(uuid, date) to authenticated;
grant execute on function public.check_in() to authenticated;
grant execute on function public.confirm_transaction(uuid) to authenticated;
grant execute on function public.settle_transaction(text, text) to service_role;

-- ---------------------------------------------------------------------------
-- SEED DATA (contoh paket & kelas). Aman diabaikan bila sudah ada.
-- ---------------------------------------------------------------------------
insert into public.packages (nama, deskripsi, harga, durasi_hari, fitur, is_popular)
select * from (values
  ('Basic', 'Cocok untuk mulai membangun kebiasaan olahraga.', 199000, 30,
    array['Akses area gym (06.00-22.00)', 'Loker harian', '2 kelas grup / bulan', 'Aplikasi tracking Gym Atlas'], false),
  ('Pro', 'Paling populer untuk anggota yang serius berlatih.', 349000, 30,
    array['Akses gym 24 jam', 'Kelas grup tanpa batas', '1 sesi personal trainer / bulan', 'Akses sauna & shower premium', 'Loker pribadi'], true),
  ('Elite', 'Pengalaman lengkap dengan pendampingan penuh.', 599000, 30,
    array['Semua benefit paket Pro', '4 sesi personal trainer / bulan', 'Konsultasi nutrisi bulanan', 'Guest pass 2x / bulan', 'Prioritas booking kelas'], false)
) as v(nama, deskripsi, harga, durasi_hari, fitur, is_popular)
where not exists (select 1 from public.packages);

insert into public.classes (nama, trainer, hari, jam, kapasitas, durasi, deskripsi, level, kategori)
select * from (values
  ('Morning HIIT', 'Dimas Prakoso', 'Senin', time '06:30', 20, 45, 'Latihan interval intensitas tinggi untuk membakar kalori.', 'Menengah', 'Cardio'),
  ('Power Yoga', 'Sarah Wijaya', 'Senin', time '18:00', 25, 60, 'Yoga dinamis untuk kekuatan & fleksibilitas.', 'Semua', 'Mind & Body'),
  ('Strength 101', 'Bagus Santoso', 'Selasa', time '19:00', 15, 50, 'Dasar angkat beban dengan teknik yang benar.', 'Pemula', 'Strength'),
  ('Spin Class', 'Nadia Putri', 'Rabu', time '07:00', 18, 45, 'Sepeda statis berirama musik yang memacu adrenalin.', 'Semua', 'Cardio'),
  ('Body Combat', 'Dimas Prakoso', 'Kamis', time '18:30', 22, 55, 'Gerakan bela diri berdampak tinggi tanpa kontak.', 'Menengah', 'Cardio'),
  ('Pilates Flow', 'Sarah Wijaya', 'Jumat', time '17:00', 20, 60, 'Perkuat otot inti dengan gerakan terkontrol.', 'Semua', 'Mind & Body'),
  ('Functional Training', 'Bagus Santoso', 'Sabtu', time '08:00', 16, 60, 'Latihan fungsional untuk aktivitas sehari-hari.', 'Menengah', 'Strength'),
  ('Zumba Party', 'Nadia Putri', 'Sabtu', time '10:00', 30, 50, 'Dansa kebugaran yang seru dan penuh energi.', 'Semua', 'Cardio')
) as v(nama, trainer, hari, jam, kapasitas, durasi, deskripsi, level, kategori)
where not exists (select 1 from public.classes);

-- ============================================================================
-- Untuk menjadikan sebuah akun sebagai ADMIN (setelah user mendaftar):
--   update public.profiles set role = 'admin' where id = '<user-uuid>';
-- ============================================================================
