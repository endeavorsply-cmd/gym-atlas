import { createClient } from "@/lib/supabase-server";
import { todayISO } from "@/lib/format";
import type { ClassRow } from "@/lib/types";

export type TrainerParticipant = {
  booking_id: string;
  user_id: string | null;
  nama: string;
  foto: string | null;
  status: string | null;
};

export type PublicTrainer = {
  id: string;
  nama: string;
  foto: string | null;
  bio: string | null;
  spesialis: string | null;
  pengalaman: string | null;
};

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function hariIndo(date: Date): string {
  return HARI[date.getDay()] ?? "";
}

export async function getTrainerClasses(): Promise<ClassRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.rpc("trainer_classes");
  return (data ?? []) as ClassRow[];
}

export async function getTrainerClass(id: string): Promise<ClassRow | null> {
  const list = await getTrainerClasses();
  return list.find((c) => c.id === id) ?? null;
}

export async function getTrainerDashboard(): Promise<{
  classes: ClassRow[];
  todayName: string;
  todayClasses: ClassRow[];
  terisi: Record<string, number>;
  totalToday: number;
}> {
  const empty = {
    classes: [] as ClassRow[],
    todayName: "",
    todayClasses: [] as ClassRow[],
    terisi: {} as Record<string, number>,
    totalToday: 0,
  };
  const supabase = await createClient();
  if (!supabase) return empty;

  const today = todayISO();
  const [{ data: classes }, { data: slots }] = await Promise.all([
    supabase.rpc("trainer_classes"),
    supabase.rpc("class_slots", { p_tanggal: today }),
  ]);

  const list = (classes ?? []) as ClassRow[];
  const terisi: Record<string, number> = {};
  ((slots ?? []) as { class_id: string; terisi: number }[]).forEach((s) => {
    terisi[s.class_id] = Number(s.terisi);
  });

  const todayName = hariIndo(new Date());
  const todayClasses = list.filter(
    (c) => (c.hari ?? "").toLowerCase() === todayName.toLowerCase(),
  );
  const totalToday = todayClasses.reduce(
    (sum, c) => sum + (terisi[c.id] ?? 0),
    0,
  );

  return { classes: list, todayName, todayClasses, terisi, totalToday };
}

export async function getClassParticipants(
  classId: string,
  tanggal: string,
): Promise<TrainerParticipant[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.rpc("class_participants", {
    p_class_id: classId,
    p_tanggal: tanggal,
  });
  return (data ?? []) as TrainerParticipant[];
}

export async function getPublicTrainers(): Promise<PublicTrainer[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.rpc("public_trainers");
  return (data ?? []) as PublicTrainer[];
}
