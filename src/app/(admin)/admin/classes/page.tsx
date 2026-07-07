import type { Metadata } from "next";
import { getAllClasses, getTrainerOptions } from "@/lib/queries";
import ClassManager from "@/components/admin/ClassManager";

export const metadata: Metadata = {
  title: "Jadwal Kelas",
};

export default async function AdminClassesPage() {
  const [classes, trainers] = await Promise.all([
    getAllClasses(),
    getTrainerOptions(),
  ]);
  return <ClassManager initial={classes} trainers={trainers} />;
}
