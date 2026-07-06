"use client";

import Link from "next/link";
import { useAuth, initials } from "@/lib/auth";

export default function UserBadge() {
  const { user, ready } = useAuth();
  const name = ready && user ? user.name : "Akun";
  const letter = ready && user ? initials(user.name) : "A";

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white">
        {letter}
      </span>
      {name}
    </Link>
  );
}
