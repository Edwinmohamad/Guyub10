import "server-only";
import lockfile from "proper-lockfile";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { join } from "node:path";
import {
  type Actor,
  type User,
  type RecordItem,
  modules,
  type Role,
} from "./model";
import type { Household } from "./households";
export type DB = {
  households?: Household[];
  users: User[];
  records: RecordItem[];
  sessions: { hash: string; userId: string; expires: number }[];
  audit: {
    id: string;
    at: string;
    actor: string;
    rt: string;
    action: string;
    target: string;
  }[];
  attempts: Record<string, { count: number; until: number }>;
};
const dir =
  process.env.GUYUB_LOCAL_DATA_DIR || join(process.cwd(), ".local-data");
const file = join(dir, "database.json");
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password: string, hash: string) {
  const [salt, digest] = hash.split(":");
  if (!salt || !digest) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function safeUser(u: User): Actor {
  const { password: _, ...actor } = u;
  void _;
  return actor;
}
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export function seed(): DB {
  const definitions: [string, Role, string][] = [
    ["super", "SUPER_ADMIN", "RW10"],
    ["rw", "KETUA_RW", "RW10"],
    ["pengurus", "PENGURUS_RW", "RW10"],
    ...["01", "02", "03", "04"].map(
      (rt) => [`rt${rt}`, "KETUA_RT", rt] as [string, Role, string],
    ),
    ["admin01", "ADMIN_RT", "01"],
    ["warga01", "RESIDENT", "01"],
    ["warga02", "RESIDENT", "02"],
    ["warga03", "RESIDENT", "03"],
    ["warga04", "RESIDENT", "04"],
    ["pelajar", "STUDENT", "01"],
    ["security", "SECURITY", "01"],
    ["operator", "OPERATOR", "01"],
    ["pokja", "POKJA10", "01"],
  ];
  const password = hashPassword("Guyub10-Lokal!");
  const users = definitions.map(([id, role, rt], i) => ({
    id,
    name: `Contoh ${id.toUpperCase()}`,
    email: `${id}@guyub.test`,
    role,
    rt,
    status: "ACTIVE" as const,
    phone: `08000000${String(i).padStart(4, "0")}`,
    address: `Alamat sintetis ${i + 1}`,
    residentType: "TETAP",
    photo: "",
    details: {
      householdId: `KK-CONTOH-${rt}-${i}`,
      nik: "00000000" + String(i).padStart(8, "0"),
      kk: "0000000000000000",
      headOfFamily: "Ya",
      gender: i % 2 ? "P" : "L",
      birthDate: "2000-01-01",
      employment: "Pekerjaan contoh",
      maritalStatus: "CONTOH",
      residentStatus: "ACTIVE",
      student: role === "STUDENT" ? "Ya" : "Tidak",
      elderly: "Tidak",
      child: "Tidak",
    },
    password,
  }));
  const records: RecordItem[] = [];
  const titles: Record<string, string[]> = {
    news: ["Kerja bakti akhir pekan", "Ruang belajar bersama"],
    activities: ["Gotong royong lingkungan", "Posyandu keluarga"],
    letters: ["Surat domisili contoh"],
    incidents: ["Lampu jalan perlu diperiksa"],
    tasks: ["Periksa drainase sebelum hujan"],
    cameras: ["Pos keamanan", "Pintu lingkungan"],
    wifi: ["Hotspot belajar"],
    students: ["Akses WiFi pelajar contoh"],
    finance: ["Iuran lingkungan", "Perawatan sarana"],
    facilities: ["Balai warga", "Lapangan bersama", "Posyandu"],
    bookings: ["Peminjaman kursi contoh"],
    umkm: ["Dapur Tetangga", "Kriya Cicadas"],
    projects: ["Perbaikan jalur pejalan kaki"],
    pokja: ["Relawan ruang belajar"],
    documents: ["Notulen rapat sintetis"],
    assets: ["Kursi lipat", "Access point demo"],
    organization: ["Ketua RT", "Sekretaris RT", "Bendahara RT"],
    gallery: ["Momen kebersamaan"],
    emergency: ["Simulasi kesiapsiagaan"],
  };
  for (const rt of ["01", "02", "03", "04"])
    for (const [module, config] of Object.entries(modules))
      for (const [i, title] of titles[module].entries()) {
        const status =
          module === "news"
            ? "PUBLISHED"
            : module === "umkm"
              ? "APPROVED"
              : module === "emergency"
                ? "CLOSED"
                : module === "cameras" && rt === "04" && i === 1
                  ? "OFFLINE"
                  : config.statuses[0];
        records.push({
          id: `${module}-${rt}-${i}`,
          module,
          title: `${title} · RT ${rt}`,
          rt,
          owner: `warga${rt}`,
          status,
          category:
            module === "finance"
              ? i === 0
                ? "INCOME"
                : "EXPENSE"
              : module === "incidents"
                ? "LIGHTING"
                : module === "emergency"
                  ? "OTHER"
                  : "UMUM",
          description:
            "Data demonstrasi sintetis untuk pengujian lokal. Tidak mewakili warga atau perangkat nyata.",
          date: new Date(Date.now() + (i - 1) * 86400000)
            .toISOString()
            .slice(0, 10),
          amount: module === "finance" ? (i === 0 ? 1500000 : 350000) : 0,
          priority: i === 0 ? "HIGH" : "NORMAL",
          pic: `Tim RT ${rt}`,
          privacy: i === 0 ? "RESIDENT" : "SECURITY",
          school: "Sekolah Contoh",
          validUntil: "2027-12-31",
          history: [],
        });
      }
  return { users, records, sessions: [], audit: [], attempts: {} };
}
let queue: Promise<unknown> = Promise.resolve();
export function transact<T>(work: (db: DB) => T | Promise<T>): Promise<T> {
  const job = queue.then(async () => {
    await mkdir(dir, { recursive: true, mode: 0o700 });
    const release = await lockfile.lock(file, {
      realpath: false,
      stale: 30000,
      retries: { retries: 50, minTimeout: 20, maxTimeout: 200 },
    });
    try {
      let db: DB;
      try {
        db = JSON.parse(await readFile(file, "utf8"));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        db = seed();
      }
      const result = await work(db);
      const temp = file + ".tmp";
      await writeFile(temp, JSON.stringify(db), { mode: 0o600 });
      await rename(temp, file);
      return result;
    } finally {
      await release();
    }
  });
  queue = job.catch(() => {});
  return job;
}
export function actorFrom(db: DB, token: string | undefined) {
  const session =
    token &&
    db.sessions.find(
      (s) => s.hash === tokenHash(token) && s.expires > Date.now(),
    );
  const u = session && db.users.find((u) => u.id === session.userId);
  return u ? safeUser(u) : null;
}
export function audit(db: DB, u: Actor, action: string, target: string) {
  db.audit.push({
    id: randomBytes(8).toString("hex"),
    at: new Date().toISOString(),
    actor: u.id,
    rt: u.rt,
    action,
    target,
  });
}
