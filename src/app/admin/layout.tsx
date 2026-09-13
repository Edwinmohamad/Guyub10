import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { logout } from "@/app/login/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAdminUser();

  // Belum login → ke halaman login
  if (!user) {
    redirect("/login");
  }

  // Login tapi bukan admin → ke beranda
  return (
    <div data-private-shell className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-950">Admin Guyub 10</h1>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="min-h-10 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900">
              Keluar
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
