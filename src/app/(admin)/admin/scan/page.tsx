import type { Metadata } from "next";
import CheckInScanner from "@/components/admin/CheckInScanner";

export const metadata: Metadata = {
  title: "Scan Check-in",
};

export default function AdminScanPage() {
  return <CheckInScanner />;
}
