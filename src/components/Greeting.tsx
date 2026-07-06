"use client";

import { useAuth, firstName } from "@/lib/auth";

export default function Greeting() {
  const { user, ready } = useAuth();
  const fn = ready && user ? firstName(user.name) : "";

  return (
    <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
      Halo{fn ? `, ${fn}` : ""} 👋
    </h1>
  );
}
