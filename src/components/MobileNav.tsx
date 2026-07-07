"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Dumbbell,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  CalendarDays,
  Ticket,
  CreditCard,
  User,
  Users,
  Receipt,
  Image as ImageIcon,
  QrCode,
  Activity,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type Variant = "member" | "admin" | "trainer";

const memberItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/progress", label: "Progress", icon: Activity },
  { href: "/classes", label: "Jadwal Kelas", icon: CalendarDays },
  { href: "/my-bookings", label: "Booking Saya", icon: Ticket },
  { href: "/subscription", label: "Langganan", icon: CreditCard },
  { href: "/profile", label: "Profil", icon: User },
];

const adminItems: NavItem[] = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/admin/members", label: "Anggota", icon: Users },
  { href: "/admin/classes", label: "Kelas", icon: CalendarDays },
  { href: "/admin/transactions", label: "Transaksi", icon: Receipt },
  { href: "/admin/promos", label: "Promo", icon: ImageIcon },
  { href: "/admin/scan", label: "Scan Check-in", icon: QrCode },
];

const trainerItems: NavItem[] = [
  { href: "/trainer", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/trainer/classes", label: "Kelas Saya", icon: CalendarDays },
  { href: "/trainer/profile", label: "Profil", icon: User },
];

const roots = new Set(["/dashboard", "/admin", "/trainer"]);

function itemsFor(variant: Variant): NavItem[] {
  if (variant === "member") return memberItems;
  if (variant === "admin") return adminItems;
  return trainerItems;
}

export default function MobileNav({
  variant,
  title,
}: {
  variant: Variant;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const items = itemsFor(variant);

  async function handleLogout() {
    setOpen(false);
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-300 md:hidden"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col border-r border-white/8 bg-ink-900">
            <div className="flex h-16 items-center justify-between border-b border-white/8 px-5">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-500 bg-brand-600/10 text-brand-500">
                  <Dumbbell className="h-4 w-4" />
                </span>
                <span className="font-serif text-base font-bold uppercase tracking-widest text-white">
                  Atlas <span className="text-brand-500">Sports</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-white"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 pt-5">
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {title}
              </p>
              <nav className="flex flex-col gap-1">
                {items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (!roots.has(item.href) && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-brand-600/15 text-brand-400"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto border-t border-white/8 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
