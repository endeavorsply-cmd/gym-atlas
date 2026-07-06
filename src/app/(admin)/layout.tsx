import { redirect } from "next/navigation";
import SideNav from "@/components/SideNav";
import { getMyProfile } from "@/lib/queries";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getMyProfile();
  // Hanya admin yang boleh masuk panel admin.
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-ink-950">
      <SideNav variant="admin" title="Admin" />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/8 bg-ink-900 px-5 md:px-8">
          <span className="text-sm font-medium text-zinc-300">Panel Admin</span>
          <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm font-medium text-zinc-200">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white">
              {(profile.nama || "A").charAt(0).toUpperCase()}
            </span>
            {profile.nama}
          </span>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
