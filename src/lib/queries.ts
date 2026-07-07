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

export async function getAllClasses(): Promise<ClassRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("classes")
    .select("*")
    .order("hari", { ascending: true })
    .order("jam", { ascending: true });
  return (data ?? []) as ClassRow[];
}

export async function getTrainerOptions(): Promise<
  { id: string; nama: string }[]
> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id, nama")
    .eq("role", "trainer")
    .order("nama", { ascending: true });
  return (data ?? []) as { id: string; nama: string }[];
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

  // QR hanya ditampilkan jika langganan masih aktif (status active &
  // belum melewati tanggal selesai). Member tanpa langganan tidak dapat QR.
  const today = todayISO();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .or(`tanggal_selesai.is.null,tanggal_selesai.gte.${today}`)
    .limit(1);
  if (!subs || subs.length === 0) return null;

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

// ---------- Analitik admin & progress member ----------

export async function getAdminAnalytics(): Promise<{
  members: number;
  activeSubs: number;
  revenueMonthly: { label: string; value: number }[];
  attendanceWeekday: { label: string; value: number }[];
  popularClasses: { nama: string; value: number }[];
}> {
  const supabase = await createClient();
  const empty = {
    members: 0,
    activeSubs: 0,
    revenueMonthly: [] as { label: string; value: number }[],
    attendanceWeekday: [] as { label: string; value: number }[],
    popularClasses: [] as { nama: string; value: number }[],
  };
  if (!supabase) return empty;

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const weekdayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const startISO = start.toISOString().slice(0, 10);

  const [membersRes, activeRes, paidRes, attRes, bookingRes, classRes] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("transactions")
        .select("jumlah, created_at")
        .eq("status", "paid")
        .gte("created_at", startISO),
      supabase.from("attendance").select("tanggal"),
      supabase.from("bookings").select("class_id").neq("status", "cancelled"),
      supabase.from("classes").select("id, nama"),
    ]);

  const revMap = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    revMap.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  for (const t of (paidRes.data ?? []) as {
    jumlah: number;
    created_at: string;
  }[]) {
    const d = new Date(t.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (revMap.has(key))
      revMap.set(key, (revMap.get(key) ?? 0) + (t.jumlah ?? 0));
  }
  const revenueMonthly = Array.from(revMap.entries()).map(([key, value]) => {
    const m = Number(key.split("-")[1]);
    return { label: monthLabels[m], value };
  });

  const wd = [0, 0, 0, 0, 0, 0, 0];
  for (const a of (attRes.data ?? []) as { tanggal: string }[]) {
    const d = new Date(a.tanggal);
    wd[d.getDay()]++;
  }
  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
  const attendanceWeekday = weekdayOrder.map((i) => ({
    label: weekdayLabels[i],
    value: wd[i],
  }));

  const classMap = new Map<string, string>();
  for (const c of (classRes.data ?? []) as { id: string; nama: string }[]) {
    classMap.set(c.id, c.nama);
  }
  const countMap = new Map<string, number>();
  for (const b of (bookingRes.data ?? []) as { class_id: string | null }[]) {
    if (!b.class_id) continue;
    countMap.set(b.class_id, (countMap.get(b.class_id) ?? 0) + 1);
  }
  const popularClasses = Array.from(countMap.entries())
    .map(([id, value]) => ({ nama: classMap.get(id) ?? "Kelas", value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    members: membersRes.count ?? 0,
    activeSubs: activeRes.count ?? 0,
    revenueMonthly,
    attendanceWeekday,
    popularClasses,
  };
}

export async function getMyProgress(): Promise<{
  totalSessions: number;
  thisMonth: number;
  streakDays: number;
  lastVisit: string | null;
  monthly: { label: string; value: number }[];
}> {
  const supabase = await createClient();
  const empty = {
    totalSessions: 0,
    thisMonth: 0,
    streakDays: 0,
    lastVisit: null as string | null,
    monthly: [] as { label: string; value: number }[],
  };
  if (!supabase) return empty;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data } = await supabase
    .from("attendance")
    .select("tanggal")
    .eq("user_id", user.id)
    .order("tanggal", { ascending: false });

  const rows = (data ?? []) as { tanggal: string }[];
  const totalSessions = rows.length;

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

  const map = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    map.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  let thisMonth = 0;
  const daySet = new Set<string>();
  for (const r of rows) {
    const d = new Date(r.tanggal);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
    if (key === thisMonthKey) thisMonth++;
    daySet.add(r.tanggal);
  }
  const monthly = Array.from(map.entries()).map(([key, value]) => {
    const m = Number(key.split("-")[1]);
    return { label: monthLabels[m], value };
  });

  const iso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };
  let streakDays = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!daySet.has(iso(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daySet.has(iso(cursor))) {
    streakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    totalSessions,
    thisMonth,
    streakDays,
    lastVisit: rows.length > 0 ? rows[0].tanggal : null,
    monthly,
  };
}
