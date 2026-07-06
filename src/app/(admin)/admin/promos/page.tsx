import type { Metadata } from "next";
import { getAllPromos } from "@/lib/queries";
import PromoManager from "@/components/admin/PromoManager";

export const metadata: Metadata = {
  title: "Promo",
};

export default async function AdminPromosPage() {
  const promos = await getAllPromos();
  return <PromoManager initial={promos} />;
}
