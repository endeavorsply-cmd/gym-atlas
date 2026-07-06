import type { Metadata } from "next";
import { getAllProfiles } from "@/lib/queries";
import MemberManager from "@/components/admin/MemberManager";

export const metadata: Metadata = {
  title: "Anggota",
};

export default async function AdminMembersPage() {
  const members = await getAllProfiles();
  return <MemberManager initial={members} />;
}
