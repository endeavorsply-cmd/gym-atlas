export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

/** "06:30:00" -> "06.30" */
export function formatJam(jam: string | null): string {
  if (!jam) return "-";
  const [h, m] = jam.split(":");
  return `${h}.${m ?? "00"}`;
}

/** "2026-07-08" -> "8 Jul 2026" */
export function formatTanggal(value: string | null): string {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function periodLabel(durasiHari: number): string {
  if (durasiHari === 30 || durasiHari === 31) return "bln";
  if (durasiHari === 365 || durasiHari === 366) return "thn";
  if (durasiHari === 7) return "mgg";
  return `${durasiHari} hari`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
