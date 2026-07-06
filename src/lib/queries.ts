import { createClient } from "@/lib/supabase-server";
import { todayISO } from "@/lib/format";
import type {
  ClassRow,
  PackageRow,
  ProfileRow,
  BookingRow,
  SubscriptionRow,
  TransactionRow,
  BookingView,
  TransactionView,
  PromoRow,
} from "@/lib/types";

// ---------- Publik (classes & packages) ----------

export async function getClasses(): Promise<ClassRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("classes")
    .select("*")
    .eq("is_active", true)
    .order("hari", { ascending: true })
    .order("jam", { ascending: true });
  return (data ?? []) as ClassRow[];
}

export async function getPackages(): Promise<PackageRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("harga", { ascending: true });
  return (data ?? []) as PackageRow[];
}

// Kelas + jumlah terisi untuk tanggal tertentu (default hari ini).
// Memakai RPC class_slots agar hitungan akurat lintas-user tanpa membocorkan RLS.
export async function getClassesForBooking(
  tanggal?: string,
): Promise<{ classes: ClassRow[]; terisi: Record<string, number> }> {
  const supabase = await createClient();
  if (!supabase) return { classes: [], terisi: {} };
  const date = tanggal ?? todayISO();

  const [{ data: classes }, { data: slots }] = await Promise.all([
    supabase
      .from("classes")
      .select("*")
      .eq("is_active", true)
      .order("hari", { ascending: true })
      .order("jam", { ascending: true }),
    supabase.rpc("class_slots", { p_tanggal: date }),
  ]);

  const terisi: Record<string, number> = {};
  ((slots ?? []) as { class_id: string; terisi: number }[]).forEach((s) => {
    terisi[s.class_id] = Number(s.terisi);
  });

  return { classes: (classes ?? []) as ClassRow[], terisi };
}

export async function getPackageById(id: string): Promise<PackageRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("packages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as PackageRow) ?? null;
}

// ---------- Member (butuh sesi login) ----------

export async function getMyProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return (data as ProfileRow) ?? null;
}

async function classMap(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
): Promise<Map<string, ClassRow>> {
  const { data } = await supabase.from("classes").select("*");
  const map = new Map<string, ClassRow>();
  ((data ?? []) as ClassRow[]).forEach((c) => map.set(c.id, c));
  return map;
}

export async function getMyBookings(): Promise<BookingView[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: bookings }, map] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("tanggal", { ascending: false }),
    classMap(supabase),
  ]);

  return ((bookings ?? []) as BookingRow[]).map((b) => {
    const c = b.class_id ? map.get(b.class_id) : undefined;
    return {
      ...b,
      className: c?.nama ?? "Kelas",
      trainer: c?.trainer ?? null,
      jam: c?.jam ?? null,
    };
  });
}

export async function getMySubscription(): Promise<{
  subscription: SubscriptionRow | null;
  pkg: PackageRow | null;
}> {
  const supabase = await createClient();
  if (!supabase) return { subscription: null, pkg: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { subscription: null, pkg: null };

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return { subscription: null, pkg: null };

  const subscription = sub as SubscriptionRow;
  let pkg: PackageRow | null = null;
  if (subscription.package_id) {
    const { data: p } = await supabase
      .from("packages")
      .select("*")
      .eq("id", subscription.package_id)
      .maybeSingle();
    pkg = (p as PackageRow) ?? null;
  }
  return { subscription, pkg };
}

export async function getMyTransactions(): Promise<TransactionView[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: trx }, { data: pkgs }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("packages").select("id, nama"),
  ]);

  const pkgMap = new Map<string, string>();
  ((pkgs ?? []) as { id: string; nama: string }[]).forEach((p) =>
    pkgMap.set(p.id, p.nama),
  );

  return ((trx ?? []) as TransactionRow[]).map((t) => ({
    ...t,
    packageName: t.package_id ? (pkgMap.get(t.package_id) ?? null) : null,
    memberName: null,
  }));
}

export async function getDashboardData(): Promise<{
  upcoming: BookingView[];
  recommended: ClassRow[];
  stats: { sessions: number; bookings: number; active: boolean };
}> {
  const empty = {
    upcoming: [] as BookingView[],
    recommended: [] as ClassRow[],
    stats: { sessions: 0, bookings: 0, active: false },
  };
  const supabase = await createClient();
  if (!supabase) return empty;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const today = todayISO();
  const [map, { data: bookings }, { count: attCount }, { data: subs }] =
    await Promise.all([
      classMap(supabase),
      supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .gte("tanggal", today)
        .neq("status", "cancelled")
        .order("tanggal", { ascending: true }),
      supabase
        .from("attendance")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1),
    ]);

  const upcoming: BookingView[] = ((bookings ?? []) as BookingRow[]).map(
    (b) => {
      const c = b.class_id ? map.get(b.class_id) : undefined;
      return {
        ...b,
        className: c?.nama ?? "Kelas",
        trainer: c?.trainer ?? null,
        jam: c?.jam ?? null,
      };
    },
  );

  const recommended = Array.from(map.values())
    .filter((c) => c.is_active !== false)
    .slice(0, 3);

  return {
    upcoming,
    recommended,
    stats: {
      sessions: attCount ?? 0,
      bookings: upcoming.length,
      active: (subs ?? []).length > 0,
    },
  };
}

// ---------- Admin ----------

export async function getAllProfiles(): Promise<ProfileRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as ProfileRow[];
}

export async function getAllTransactions(): Promise<TransactionView[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const [{ data: trx }, { data: pkgs }, { data: profiles }] = await Promise.all(
    [
      supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("packages").select("id, nama"),
      supabase.from("profiles").select("id, nama"),
    ],
  );

  const pkgMap = new Map<string, string>();
  ((pkgs ?? []) as { id: string; nama: string }[]).forEach((p) =>
    pkgMap.set(p.id, p.nama),
  );
  const profMap = new Map<string, string>();
  ((profiles ?? []) as { id: string; nama: string }[]).forEach((p) =>
    profMap.set(p.id, p.nama),
  );

  return ((trx ?? []) as TransactionRow[]).map((t) => ({
    ...t,
    packageName: t.package_id ? (pkgMap.get(t.package_id) ?? null) : null,
    memberName: t.user_id ? (profMap.get(t.user_id) ?? null) : null,
  }));
}

export async function getAdminStats(): Promise<{
  members: number;
  activeSubs: number;
  revenue: number;
  transactions: number;
}> {
  const supabase = await createClient();
  if (!supabase)
    return { members: 0, activeSubs: 0, revenue: 0, transactions: 0 };

  const [members, activeSubs, transactions, paid] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("transactions").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("jumlah").eq("status", "paid"),
  ]);

  const revenue = ((paid.data ?? []) as { jumlah: number }[]).reduce(
    (sum, t) => sum + (t.jumlah ?? 0),
    0,
  );

  return {
    members: members.count ?? 0,
    activeSubs: activeSubs.count ?? 0,
    revenue,
    transactions: transactions.count ?? 0,
  };
}

// ---------- Promo (landing page) ----------

export async function getActivePromos(): Promise<PromoRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("promos")
    .select("*")
    .eq("is_active", true)
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as PromoRow[];
}

export async function getAllPromos(): Promise<PromoRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("promos")
    .select("*")
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as PromoRow[];
}

// ---------- QR Check-in ----------

export async function getMyCheckinCode(): Promise<{
  code: string;
  nama: string;
} | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("checkin_code, nama")
    .eq("id", user.id)
    .maybeSingle();
  if (!data || !data.checkin_code) return null;
  return {
    code: data.checkin_code as string,
    nama: (data.nama as string) ?? "",
  };
}

// ---- Helper untuk fitur progress & analitik ----

// Tanggal YYYY-MM-DD dalam zona waktu Asia/Jakarta.
function jakartaDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
}

// 6 bulan terakhir (termasuk bulan ini) dalam label singkat Indonesia.
function lastSixMonths(): { key: string; label: string }[] {
  const bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const nowJkt = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  const [y, mo] = nowJkt.split("-").map(Number);
  const out: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, mo - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key, label: bulan[d.getMonth()] });
  }
  return out;
}

// Progress kehadiran member yang sedang login.
export async function getMyProgress(): Promise<{
  totalSessions: number;
  thisMonth: number;
  streakDays: number;
  lastVisit: string | null;
  monthly: { label: string; value: number }[];
}> {
  const empty = {
    totalSessions: 0,
    thisMonth: 0,
    streakDays: 0,
    lastVisit: null as string | null,
    monthly: [] as { label: string; value: number }[],
  };
  const supabase = await createClient();
  if (!supabase) return empty;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data } = await supabase
    .from("attendance")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as { created_at: string | null }[];
  const dates = rows
    .map((r) => (r.created_at ? jakartaDate(r.created_at) : null))
    .filter((d): d is string => !!d);
  const dateSet = new Set(dates);

  const monthly = lastSixMonths().map((m) => ({
    label: m.label,
    value: dates.filter((d) => d.slice(0, 7) === m.key).length,
  }));

  const nowMonth = new Date()
    .toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })
    .slice(0, 7);
  const thisMonth = dates.filter((d) => d.slice(0, 7) === nowMonth).length;

  // Streak hari beruntun (mundur dari hari ini; kalau hari ini kosong mulai kemarin).
  let streakDays = 0;
  const cursor = new Date();
  if (!dateSet.has(jakartaDate(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dateSet.has(jakartaDate(cursor.toISOString()))) {
    streakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    totalSessions: rows.length,
    thisMonth,
    streakDays,
    lastVisit: dates[0] ?? null,
    monthly,
  };
}

// Data analitik untuk dashboard admin.
export async function getAdminAnalytics(): Promise<{
  revenueMonthly: { label: string; value: number }[];
  popularClasses: { nama: string; value: number }[];
  attendanceWeekday: { label: string; value: number }[];
  members: number;
  activeSubs: number;
}> {
  const empty = {
    revenueMonthly: [] as { label: string; value: number }[],
    popularClasses: [] as { nama: string; value: number }[],
    attendanceWeekday: [] as { label: string; value: number }[],
    members: 0,
    activeSubs: 0,
  };
  const supabase = await createClient();
  if (!supabase) return empty;

  const [
    { data: paid },
    { data: bookings },
    { data: att },
    membersRes,
    activeRes,
    map,
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("jumlah, paid_at, created_at")
      .eq("status", "paid"),
    supabase.from("bookings").select("class_id, status"),
    supabase.from("attendance").select("created_at"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    classMap(supabase),
  ]);

  const months = lastSixMonths();
  const revByKey = new Map<string, number>();
  (
    (paid ?? []) as {
      jumlah: number;
      paid_at: string | null;
      created_at: string | null;
    }[]
  ).forEach((t) => {
    const iso = t.paid_at ?? t.created_at;
    if (!iso) return;
    const key = jakartaDate(iso).slice(0, 7);
    revByKey.set(key, (revByKey.get(key) ?? 0) + (t.jumlah ?? 0));
  });
  const revenueMonthly = months.map((m) => ({
    label: m.label,
    value: revByKey.get(m.key) ?? 0,
  }));

  const clsCount = new Map<string, number>();
  ((bookings ?? []) as { class_id: string | null; status: string | null }[]).forEach(
    (b) => {
      if (!b.class_id || b.status === "cancelled") return;
      clsCount.set(b.class_id, (clsCount.get(b.class_id) ?? 0) + 1);
    },
  );
  const popularClasses = Array.from(clsCount.entries())
    .map(([id, value]) => ({ nama: map.get(id)?.nama ?? "Kelas", value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const hari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const wd = [0, 0, 0, 0, 0, 0, 0];
  ((att ?? []) as { created_at: string | null }[]).forEach((a) => {
    if (!a.created_at) return;
    const idx = new Date(
      new Date(a.created_at).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
      }),
    ).getDay();
    wd[idx] = (wd[idx] ?? 0) + 1;
  });
  const attendanceWeekday = hari.map((label, i) => ({ label, value: wd[i] }));

  return {
    revenueMonthly,
    popularClasses,
    attendanceWeekday,
    members: membersRes.count ?? 0,
    activeSubs: activeRes.count ?? 0,
  };
}
