import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTrainerClass, getClassParticipants } from "@/lib/trainer-queries";
import { todayISO, formatJam } from "@/lib/format";
import AttendanceList from "@/components/trainer/AttendanceList";

export default async function TrainerClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tanggal?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tanggal = sp.tanggal || todayISO();

  const cls = await getTrainerClass(id);
  if (!cls) notFound();

  const participants = await getClassParticipants(id, tanggal);

  return (
    <div className="space-y-6">
      <Link
        href="/trainer/classes"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke kelas
      </Link>

      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
          {cls.nama}
        </h1>
        <p className="mt-1 text-zinc-400">
          {[cls.hari, formatJam(cls.jam)].filter(Boolean).join(" - ")}
          {cls.level ? ` - ${cls.level}` : ""}
        </p>
      </div>

      <AttendanceList
        key={tanggal}
        classId={id}
        tanggal={tanggal}
        initial={participants}
      />
    </div>
  );
}