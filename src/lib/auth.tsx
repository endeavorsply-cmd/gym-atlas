"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string | null;
};

type Result = {
  error?: string;
  needsConfirmation?: boolean;
  role?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  configured: boolean;
  signUp: (name: string, email: string, password: string) => Promise<Result>;
  signIn: (email: string, password: string) => Promise<Result>;
  updateProfile: (name: string, phone: string) => Promise<Result>;
  reload: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const NOT_CONFIGURED =
  "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const configured = supabase !== null;

  // Menyusun AuthUser dari user Supabase + baris profil. setState hanya dipanggil
  // dari sini (dipicu oleh callback subscription / aksi user), bukan di body efek.
  const applyUser = useCallback(
    async (authUser: User | null) => {
      if (!supabase || !authUser) {
        setUser(null);
        setLoaded(true);
        return;
      }

      const meta = (authUser.user_metadata ?? {}) as { full_name?: string };
      const fallbackName =
        meta.full_name ||
        (authUser.email ? authUser.email.split("@")[0] : "Anggota");

      let { data: profile } = await supabase
        .from("profiles")
        .select("nama, no_hp, role")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!profile) {
        await supabase
          .from("profiles")
          .upsert({ id: authUser.id, nama: fallbackName });
        profile = { nama: fallbackName, no_hp: null, role: null };
      }

      setUser({
        id: authUser.id,
        name: profile.nama || fallbackName,
        email: authUser.email ?? "",
        phone: profile.no_hp ?? "",
        role: profile.role ?? null,
      });
      setLoaded(true);
    },
    [supabase],
  );

  const load = useCallback(async () => {
    if (!supabase) return;
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    await applyUser(authUser);
  }, [supabase, applyUser]);

  useEffect(() => {
    if (!supabase) return;
    // Hanya subscribe. onAuthStateChange memancarkan INITIAL_SESSION saat mount,
    // sehingga load awal terjadi di dalam callback (pola yang disarankan React).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, applyUser]);

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async (name, email, password) => {
      if (!supabase) return { error: NOT_CONFIGURED };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) return { error: error.message };
      if (!data.session) return { needsConfirmation: true };
      if (data.user) {
        await supabase
          .from("profiles")
          .upsert({ id: data.user.id, nama: name });
        await applyUser(data.user);
      }
      return {};
    },
    [supabase, applyUser],
  );

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password) => {
      if (!supabase) return { error: NOT_CONFIGURED };
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };

      let role: string | null = null;
      if (data.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();
        role = prof?.role ?? null;
        await applyUser(data.user);
      }
      return { role };
    },
    [supabase, applyUser],
  );

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (name, phone) => {
      if (!supabase) return { error: NOT_CONFIGURED };
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return { error: "Sesi tidak ditemukan." };
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: authUser.id, nama: name, no_hp: phone });
      if (error) return { error: error.message };
      await applyUser(authUser);
      return {};
    },
    [supabase, applyUser],
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value: AuthContextValue = {
    user,
    ready: configured ? loaded : true,
    configured,
    signUp,
    signIn,
    updateProfile,
    reload: load,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return ctx;
}

export function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "U";
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}
