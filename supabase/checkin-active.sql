-- ============================================================================
-- Atlas Sports Club - Barcode/QR check-in KHUSUS member aktif
-- ----------------------------------------------------------------------------
-- RPC ini menggantikan check_in_by_code lama. Selain mencatat kehadiran,
-- ia MEMVALIDASI langganan di sisi server, sehingga barcode hasil screenshot
-- TIDAK bisa dipakai lagi ketika langganan sudah habis.
--
-- Jalankan seluruh isi file ini di Supabase -> SQL Editor -> Run.
-- Aman dijalankan ulang (create or replace).
-- ============================================================================

create or replace function public.check_in_by_code(p_code uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user   uuid;
  v_nama   text;
  v_active boolean;
  v_until  date;
  v_rows   integer;
begin
  -- 1) Cari member berdasarkan kode QR pada kartu anggota.
  select id, nama
    into v_user, v_nama
  from public.profiles
  where checkin_code = p_code;

  if v_user is null then
    return jsonb_build_object(
      'status', 'error',
      'message', 'QR tidak dikenali. Kartu anggota tidak ditemukan.'
    );
  end if;

  -- 2) Pastikan ada langganan yang benar-benar aktif:
  --    status = 'active' DAN belum melewati tanggal selesai (atau tanpa batas).
  --    Cek tanggal juga penting agar screenshot barcode lama tidak bisa dipakai
  --    walau status belum sempat diubah oleh cron.
  select true, tanggal_selesai
    into v_active, v_until
  from public.subscriptions
  where user_id = v_user
    and status = 'active'
    and (tanggal_selesai is null or tanggal_selesai >= current_date)
  order by tanggal_selesai desc nulls last
  limit 1;

  if not coalesce(v_active, false) then
    return jsonb_build_object(
      'status', 'expired',
      'nama', v_nama,
      'message', 'Langganan tidak aktif atau sudah habis. Akses masuk ditolak.'
    );
  end if;

  -- 3) Catat kehadiran (maksimal 1x per hari).
  insert into public.attendance (user_id, tanggal)
  values (v_user, current_date)
  on conflict (user_id, tanggal) do nothing;

  get diagnostics v_rows = row_count;

  if v_rows = 0 then
    return jsonb_build_object(
      'status', 'already',
      'nama', v_nama,
      'valid_until', v_until,
      'message', 'Anggota sudah check-in hari ini.'
    );
  end if;

  return jsonb_build_object(
    'status', 'success',
    'nama', v_nama,
    'valid_until', v_until,
    'message', 'Check-in berhasil. Selamat berlatih!'
  );
end;
$$;

grant execute on function public.check_in_by_code(uuid) to authenticated;
