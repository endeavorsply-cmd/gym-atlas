-- ============================================================================
-- Atlas Sports Club - Fitur Trainer
-- Jalankan seluruh file ini di Supabase SQL Editor (sekali jalan).
-- Aman dijalankan ulang (idempotent).
-- ============================================================================

-- Kolom baru: hubungkan kelas ke akun trainer + field profil publik.
alter table public.classes
  add column if not exists trainer_id uuid references public.profiles (id) on delete set null;
create index if not exists classes_trainer_idx on public.classes (trainer_id);

alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists spesialis text;
alter table public.profiles add column if not exists pengalaman text;

-- RPC: daftar kelas milik trainer yang sedang login.
create or replace function public.trainer_classes()
returns setof public.classes
language sql
security definer
set search_path = public
stable
as $$
  select * from public.classes
  where trainer_id = auth.uid()
  order by hari, jam;
$$;

-- RPC: peserta sebuah kelas pada tanggal tertentu (hanya trainer kelas / admin).
create or replace function public.class_participants(p_class_id uuid, p_tanggal date)
returns table (booking_id uuid, user_id uuid, nama text, foto text, status text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.is_admin() or exists (
    select 1 from public.classes c
    where c.id = p_class_id and c.trainer_id = auth.uid()
  )) then
    raise exception 'Kamu bukan trainer kelas ini.';
  end if;
  return query
    select b.id, b.user_id, coalesce(p.nama, 'Anggota'), p.foto, b.status
    from public.bookings b
    left join public.profiles p on p.id = b.user_id
    where b.class_id = p_class_id
      and b.tanggal = p_tanggal
      and b.status <> 'cancelled'
    order by coalesce(p.nama, 'Anggota');
end;
$$;

-- RPC: tandai kehadiran peserta (toggle hadir/belum) oleh trainer kelas / admin.
create or replace function public.mark_attendance(p_booking_id uuid, p_hadir boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class uuid;
begin
  select class_id into v_class from public.bookings where id = p_booking_id;
  if v_class is null then
    raise exception 'Booking tidak ditemukan.';
  end if;
  if not (public.is_admin() or exists (
    select 1 from public.classes c
    where c.id = v_class and c.trainer_id = auth.uid()
  )) then
    raise exception 'Kamu bukan trainer kelas ini.';
  end if;
  update public.bookings
    set status = case when p_hadir then 'completed' else 'upcoming' end
    where id = p_booking_id;
end;
$$;

-- RPC: profil trainer publik (hanya field aman, boleh dibaca siapa saja).
create or replace function public.public_trainers()
returns table (id uuid, nama text, foto text, bio text, spesialis text, pengalaman text)
language sql
security definer
set search_path = public
stable
as $$
  select id, nama, foto, bio, spesialis, pengalaman
  from public.profiles
  where role = 'trainer'
  order by nama;
$$;

-- Grants
grant execute on function public.trainer_classes() to authenticated;
grant execute on function public.class_participants(uuid, date) to authenticated;
grant execute on function public.mark_attendance(uuid, boolean) to authenticated;
grant execute on function public.public_trainers() to anon, authenticated;

-- ============================================================================
-- CARA MENAUTKAN TRAINER KE KELAS (contoh, jalankan sesuai kebutuhan):
--   1) Jadikan akun sebagai trainer:
--        update public.profiles set role = 'trainer' where id = '<user-uuid>';
--   2) Tautkan kelas ke akun trainer (berdasarkan nama trainer di kolom lama):
--        update public.classes set trainer_id = '<user-uuid>'
--        where trainer = 'Dimas Prakoso';
-- ============================================================================
