import type { Metadata } from "next";
import { getAllTransactions } from "@/lib/queries";
import TransactionManager from "@/components/admin/TransactionManager";

export const metadata: Metadata = {
  title: "Transaksi",
};

export default async function AdminTransactionsPage() {
  const transactions = await getAllTransactions();
  return <TransactionManager initial={transactions} />;
}
