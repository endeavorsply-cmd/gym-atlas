import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { siteConfig } from "@/lib/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-ink-950 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-ink-900 to-black" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-brand-800/20 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-500 bg-brand-600/10 text-brand-500">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="font-serif text-lg font-bold uppercase tracking-widest">
            Atlas <span className="text-brand-500">Sports</span>
          </span>
        </Link>
        <div className="relative">
          <h2 className="font-serif text-4xl font-bold leading-tight">
            Bangun versi terkuat dirimu.
          </h2>
          <p className="mt-4 max-w-sm text-zinc-400">
            Booking kelas favorit, pantau progres, dan kelola membership dari
            satu dashboard {siteConfig.shortName}.
          </p>
        </div>
        <p className="relative text-sm text-zinc-500">{siteConfig.address}</p>
      </div>

      <div className="flex items-center justify-center bg-ink-900 p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
