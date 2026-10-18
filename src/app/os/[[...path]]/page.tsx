import { cookies } from "next/headers";
import { Portal } from "@/components/os/Portal";
import { transact, actorFrom, safeUser } from "@/lib/local/store";
import {
  active,
  canRead,
  canManage,
  publicRecord,
  inScope,
  manager,
} from "@/lib/local/model";
import { notFound, redirect } from "next/navigation";
export const dynamic = "force-dynamic";
const publicPaths = [
  "",
  "rw10",
  "rt",
  "profil",
  "organisasi",
  "informasi",
  "kegiatan",
  "fasilitas",
  "umkm",
  "galeri",
  "kas",
  "wifi",
  "cctv",
  "peta",
  "darurat",
  "pokja10",
  "inkamnet",
  "login",
  "daftar",
];
const privatePaths = [
  "command",
  "today",
  "my-rt",
  "services",
  "workspace",
  "residents",
  "notifications",
  "search",
  "card",
  "admin",
  "warga",
  "layanan",
  "aspirasi",
  "laporan",
];
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const parts = (await params).path || [];
  const path = parts.join("/");
  if (!publicPaths.includes(parts[0] || "") && !privatePaths.includes(parts[0]))
    notFound();
  if (
    parts[0] === "rt" &&
    (!["01", "02", "03", "04"].includes(parts[1]) || parts.length !== 2)
  )
    notFound();
  const cookieStore = await cookies();
  const payload = await transact((db) => {
    const user = actorFrom(db, cookieStore.get("guyub_local_session")?.value);
    const records = db.records
      .filter((r) => canRead(user, r))
      .map((r) =>
        active(user) && (canManage(user, r) || r.owner === user.id)
          ? r
          : publicRecord(r),
      );
    return {
      user,
      records,
      users: manager(user)
        ? db.users.filter((x) => inScope(user!, x)).map(safeUser)
        : [],
      events: manager(user)
        ? db.audit
            .filter((e) => inScope(user!, e))
            .slice(-30)
            .reverse()
        : [],
    };
  });
  if (privatePaths.includes(parts[0]) && !payload.user) redirect("/login");
  if (
    ["command", "today", "admin", "residents"].includes(parts[0]) &&
    !manager(payload.user)
  )
    redirect("/my-rt");
  return (
    <Portal
      key={[path,payload.user?.id,payload.user?.role,payload.user?.rt,payload.user?.status].join(":")}
      path={path}
      {...payload}
      today={new Date().toISOString().slice(0, 10)}
      tomorrow={new Date(new Date().getTime() + 86400000)
        .toISOString()
        .slice(0, 10)}
    />
  );
}
