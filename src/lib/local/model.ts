export const roles = [
  "SUPER_ADMIN",
  "KETUA_RW",
  "PENGURUS_RW",
  "KETUA_RT",
  "ADMIN_RT",
  "SECURITY",
  "OPERATOR",
  "POKJA10",
  "RESIDENT",
  "STUDENT",
] as const;
export type Role = (typeof roles)[number];
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  rt: string;
  status: "PENDING" | "VERIFIED" | "ACTIVE" | "SUSPENDED";
  phone: string;
  address: string;
  residentType: string;
  photo: string;
  details?: Record<string, string>;
  password: string;
};
export type Actor = Omit<User, "password">;
export type RecordItem = {
  id: string;
  module: string;
  title: string;
  rt: string;
  owner: string;
  status: string;
  category: string;
  description: string;
  date: string;
  amount: number;
  priority: string;
  pic: string;
  privacy: string;
  school: string;
  validUntil: string;
  data?: Record<string, string>;
  history: { at: string; actor: string; status: string; note: string }[];
};
export const modules: Record<
  string,
  { label: string; statuses: string[]; public?: boolean }
> = {
  news: { label: "Berita", statuses: ["DRAFT", "PUBLISHED"], public: true },
  activities: {
    label: "Kegiatan",
    statuses: ["PLANNED", "ACTIVE", "DONE"],
    public: true,
  },
  letters: {
    label: "Surat warga",
    statuses: [
      "SUBMITTED",
      "RT_REVIEW",
      "RT_APPROVED",
      "RW_REVIEW",
      "APPROVED",
      "PDF_READY",
      "ARCHIVED",
    ],
  },
  incidents: {
    label: "Laporan & aspirasi",
    statuses: [
      "REPORTED",
      "VERIFIED",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
    ],
  },
  tasks: {
    label: "Tugas operasional",
    statuses: ["TODO", "IN_PROGRESS", "WAITING", "DONE"],
  },
  cameras: {
    label: "CCTV Center",
    statuses: ["ONLINE", "OFFLINE"],
    public: true,
  },
  wifi: {
    label: "WiFi Pelajar",
    statuses: ["ONLINE", "DEGRADED", "OFFLINE"],
    public: true,
  },
  students: {
    label: "Akses pelajar",
    statuses: ["PENDING", "VERIFIED", "ACTIVE", "SUSPENDED"],
  },
  finance: { label: "Keuangan", statuses: ["RECORDED"], public: true },
  facilities: {
    label: "Fasilitas",
    statuses: ["AVAILABLE", "MAINTENANCE"],
    public: true,
  },
  bookings: {
    label: "Peminjaman fasilitas",
    statuses: ["REQUESTED", "APPROVED", "REJECTED", "BORROWED", "RETURNED"],
  },
  umkm: {
    label: "UMKM",
    statuses: ["PENDING", "APPROVED", "REJECTED"],
    public: true,
  },
  projects: {
    label: "Proyek lingkungan",
    statuses: ["PLANNED", "IN_PROGRESS", "DONE"],
    public: true,
  },
  pokja: {
    label: "POKJA10 Hub",
    statuses: ["OPEN", "IN_PROGRESS", "DONE"],
    public: true,
  },
  documents: { label: "Arsip digital", statuses: ["INTERNAL", "ARCHIVED"] },
  assets: {
    label: "Aset digital",
    statuses: ["GOOD", "MAINTENANCE", "RETIRED"],
  },
  organization: {
    label: "Struktur organisasi",
    statuses: ["ACTIVE"],
    public: true,
  },
  gallery: { label: "Galeri", statuses: ["PUBLISHED"], public: true },
  emergency: {
    label: "Mode darurat",
    statuses: ["ACTIVE", "CLOSED"],
    public: true,
  },
};
export const rwRoles: Role[] = ["SUPER_ADMIN", "KETUA_RW", "PENGURUS_RW"];
export const rtRoles: Role[] = ["KETUA_RT", "ADMIN_RT"];
export function active(u: Actor | null): u is Actor {
  return !!u && (u.status === "ACTIVE" || u.status === "VERIFIED");
}
export function manager(u: Actor | null) {
  return active(u) && [...rwRoles, ...rtRoles].includes(u.role);
}
export function inScope(u: Actor, r: { rt: string }) {
  return rwRoles.includes(u.role) || r.rt === u.rt;
}
export function canRead(u: Actor | null, r: RecordItem) {
  if (active(u)) {
    if (manager(u) && inScope(u, r)) return true;
    if (
      r.owner === u.id &&
      ["letters", "incidents", "students", "bookings", "umkm"].includes(
        r.module,
      )
    )
      return true;
    if (
      u.role === "SECURITY" &&
      inScope(u, r) &&
      ["cameras", "incidents", "tasks", "assets"].includes(r.module)
    )
      return true;
    if (
      u.role === "OPERATOR" &&
      inScope(u, r) &&
      ["wifi", "students", "tasks", "assets"].includes(r.module)
    )
      return true;
    if (
      u.role === "POKJA10" &&
      inScope(u, r) &&
      ["pokja", "activities", "tasks", "projects"].includes(r.module)
    )
      return true;
  }
  return (
    !!modules[r.module]?.public &&
    !(r.module === "news" && r.status !== "PUBLISHED") &&
    !(r.module === "umkm" && r.status !== "APPROVED")
  );
}
export function canCreate(u: Actor | null, module: string, rt: string) {
  if (!active(u) || !modules[module]) return false;
  if (manager(u)) return inScope(u, { rt });
  if (rt !== u.rt) return false;
  if (["letters", "incidents", "bookings", "umkm"].includes(module))
    return true;
  if (module === "students") return ["RESIDENT", "STUDENT"].includes(u.role);
  return (
    (u.role === "SECURITY" &&
      ["cameras", "incidents", "tasks", "assets"].includes(module)) ||
    (u.role === "OPERATOR" &&
      ["wifi", "students", "tasks", "assets"].includes(module)) ||
    (u.role === "POKJA10" &&
      ["pokja", "activities", "tasks", "projects"].includes(module))
  );
}
export function canManage(u: Actor | null, r: RecordItem) {
  if (!active(u) || !inScope(u, r)) return false;
  return (
    manager(u) ||
    (u.role === "SECURITY" &&
      ["cameras", "incidents", "tasks", "assets"].includes(r.module)) ||
    (u.role === "OPERATOR" &&
      ["wifi", "students", "tasks", "assets"].includes(r.module)) ||
    (u.role === "POKJA10" &&
      ["pokja", "activities", "tasks", "projects"].includes(r.module))
  );
}
export function canCamera(u: Actor | null, r: RecordItem) {
  if (!active(u) || !inScope(u, r)) return false;
  if (rwRoles.includes(u.role)) return true;
  if (r.privacy === "RW_ADMIN") return false;
  if (rtRoles.includes(u.role)) return true;
  if (r.privacy === "RT_ADMIN") return false;
  if (u.role === "SECURITY") return true;
  return r.privacy === "RESIDENT";
}
export function publicRecord(r: RecordItem): Partial<RecordItem> {
  const { id, module, title, rt, status, category, date, amount, privacy } = r;
  // Public projection never includes owner, notes, PIC, internal history or evidence.
  return {
    id,
    module,
    title,
    rt,
    status,
    category,
    date,
    amount: module === "finance" ? amount : 0,
    privacy,
  };
}
export function transitionAllowed(u: Actor, r: RecordItem, next: string) {
  if (
    !canManage(u, r) ||
    !modules[r.module]?.statuses.includes(next) ||
    next === r.status
  )
    return false;
  if (r.module === "letters") {
    const flow: Record<string, string[]> = {
      SUBMITTED: ["RT_REVIEW"],
      RT_REVIEW: ["RT_APPROVED"],
      RT_APPROVED: ["RW_REVIEW", "APPROVED"],
      RW_REVIEW: ["APPROVED"],
      APPROVED: ["PDF_READY"],
      PDF_READY: ["ARCHIVED"],
    };
    if (!flow[r.status]?.includes(next)) return false;
    if (
      ["APPROVED", "PDF_READY", "ARCHIVED"].includes(next) &&
      !rwRoles.includes(u.role)
    )
      return false;
  }
  if (r.module === "incidents")
    return (
      modules.incidents.statuses.indexOf(next) ===
      modules.incidents.statuses.indexOf(r.status) + 1
    );
  if (r.module === "bookings") {
    const flow: Record<string, string[]> = {
      REQUESTED: ["APPROVED", "REJECTED"],
      APPROVED: ["BORROWED"],
      BORROWED: ["RETURNED"],
    };
    return !!flow[r.status]?.includes(next);
  }
  return true;
}
export const moduleFields: Record<string, Record<string, string>> = {
  letters: {
    service: "Jenis layanan",
    approver: "Penyetuju",
    attachment: "Catatan lampiran (simulasi)",
  },
  cameras: {
    location: "Lokasi fiktif",
    lastHealthCheck: "Pemeriksaan terakhir",
  },
  wifi: { location: "Lokasi hotspot fiktif", usage: "Penggunaan (simulasi)" },
  students: { hotspot: "Hotspot tujuan", usage: "Penggunaan (simulasi)" },
  finance: { evidence: "Referensi bukti sintetis" },
  facilities: {
    location: "Lokasi fiktif",
    condition: "Kondisi",
    maintenanceDate: "Tanggal perawatan",
    photo: "Referensi foto contoh",
  },
  assets: {
    model: "Model",
    location: "Lokasi fiktif",
    condition: "Kondisi",
    maintenanceDate: "Tanggal perawatan",
    maintenanceHistory: "Riwayat perawatan",
  },
  umkm: {
    businessOwner: "Pemilik usaha contoh",
    phone: "Telepon contoh",
    location: "Lokasi fiktif",
    openingHours: "Jam buka",
    photo: "Referensi gambar contoh",
  },
  organization: {
    name: "Nama pengurus contoh",
    responsibility: "Tanggung jawab",
    term: "Masa jabatan",
    publicContact: "Kontak publik contoh",
    photo: "Referensi foto contoh",
  },
  documents: { year: "Tahun arsip", documentCategory: "Kategori arsip" },
  activities: { location: "Lokasi kegiatan", volunteer: "Relawan" },
  projects: { progress: "Kemajuan (%)", location: "Lokasi fiktif" },
  emergency: { contact: "Kontak bantuan contoh", timestamp: "Waktu simulasi" },
  bookings: {
    facility: "Fasilitas / aset",
    returnDate: "Tanggal pengembalian",
  },
  pokja: { volunteer: "Relawan", documentation: "Dokumentasi kegiatan" },
};
export const residentFields: Record<string, string> = {
  householdId: "ID rumah tangga",
  nik: "NIK sintetis",
  kk: "KK sintetis",
  headOfFamily: "Kepala keluarga",
  gender: "Jenis kelamin",
  birthDate: "Tanggal lahir",
  employment: "Pekerjaan",
  maritalStatus: "Status perkawinan",
  residentStatus: "Status kependudukan",
  student: "Pelajar",
  elderly: "Lansia",
  child: "Anak",
};
