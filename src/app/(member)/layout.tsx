import { redirect } from "next/navigation";
import SideNav from "@/components/SideNav";
import MobileNav from "@/components/MobileNav";
import UserBadge from "@/components/UserBadge";
import { getMyProfile } from "@/lib/queries";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getMyProfile();
  // Admin & trainer diarahkan ke area masing-masing.
  if (profile?.role === "admin") {
    redirect("/admin");
  }
  if (profile?.role === "trainer") {
    redirect("/trainer");
  }

  return (
    <div className="flex min-h-screen bg-ink-950">
      <SideNav variant="member" title="Member" />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/8 bg-ink-900 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <MobileNav variant="member" title="Member" />
            <span className="text-sm text-zinc-400">
              Selamat datang kembali
            </span>
          </div>
          <UserBadge />
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}