import { randomUUID } from "node:crypto";
import { manager, inScope, type Actor, type User } from "./model";
export type FamilyMember = {
  id: string;
  name: string;
  nik: string;
  gender: string;
  birthDate: string;
  employment: string;
  maritalStatus: string;
  residentStatus: string;
  relation: string;
  student: boolean;
  elderly: boolean;
  child: boolean;
};
export type Household = {
  id: string;
  rt: string;
  kk: string;
  address: string;
  headId: string;
  members: FamilyMember[];
};
export class FamilyError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
function field(
  body: Record<string, unknown>,
  key: string,
  max = 150,
  required = false,
) {
  const v = body[key];
  if (v == null && !required) return "";
  if (typeof v !== "string" || v.trim().length > max || (required && !v.trim()))
    throw new FamilyError(`Isian ${key} tidak valid`);
  return v.trim();
}
function identity(value: string) {
  if (value && !/^0[0-9]{15}$/.test(value))
    throw new FamilyError("NIK/KK sintetis harus 16 digit diawali 0");
  return value;
}
export function validateMember(body: Record<string, unknown>): FamilyMember {
  const gender = field(body, "gender"),
    residentStatus = field(body, "residentStatus") || "UNVERIFIED",
    birthDate = field(body, "birthDate", 10);
  if (!["L", "P", ""].includes(gender))
    throw new FamilyError("Jenis kelamin tidak valid");
  if (
    !["ACTIVE", "MOVED", "TEMPORARY", "DECEASED", "UNVERIFIED"].includes(
      residentStatus,
    )
  )
    throw new FamilyError("Status kependudukan tidak valid");
  if (
    birthDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
      !Number.isFinite(Date.parse(birthDate)) ||
      new Date(birthDate).toISOString().slice(0, 10) !== birthDate ||
      birthDate > new Date().toISOString().slice(0, 10))
  )
    throw new FamilyError("Tanggal lahir tidak valid");
  for (const key of ["student", "elderly", "child"])
    if (body[key] !== undefined && typeof body[key] !== "boolean")
      throw new FamilyError("Penanda anggota harus boolean");
  return {
    id: randomUUID(),
    name: field(body, "name", 100, true),
    nik: identity(field(body, "nik", 16)),
    gender,
    birthDate,
    employment: field(body, "employment"),
    maritalStatus: field(body, "maritalStatus"),
    residentStatus,
    relation: field(body, "relation", 60) || "Anggota",
    student: body.student === true,
    elderly: body.elderly === true,
    child: body.child === true,
  };
}
export function initialHouseholds(users: User[]): Household[] {
  return users
    .filter((u) => ["01", "02", "03", "04"].includes(u.rt))
    .map((u) => {
      const member = validateMember({
        name: u.name,
        nik: u.details?.nik || "",
        gender: u.details?.gender || "",
        birthDate: u.details?.birthDate || "",
        employment: u.details?.employment || "",
        maritalStatus: u.details?.maritalStatus || "",
        residentStatus: u.details?.residentStatus || "UNVERIFIED",
        relation: "Kepala keluarga",
        student: u.role === "STUDENT",
      });
      return {
        id: randomUUID(),
        rt: u.rt,
        kk: identity(u.details?.kk || ""),
        address: u.address,
        headId: member.id,
        members: [member],
      };
    });
}
export function changeHouseholds(
  households: Household[],
  actor: Actor,
  body: Record<string, unknown>,
): Household {
  if (!manager(actor)) throw new FamilyError("Akses ditolak", 403);
  if (body.action === "create") {
    const rt = field(body, "rt", 2, true);
    if (!["01", "02", "03", "04"].includes(rt) || !inScope(actor, { rt }))
      throw new FamilyError("RT di luar kewenangan", 403);
    const h: Household = {
      id: randomUUID(),
      rt,
      kk: identity(field(body, "kk", 16)),
      address: field(body, "address", 250, true),
      headId: "",
      members: [],
    };
    households.push(h);
    return h;
  }
  const h = households.find((h) => h.id === body.id);
  if (!h || !inScope(actor, h))
    throw new FamilyError(
      "Rumah tangga tidak ditemukan atau akses ditolak",
      403,
    );
  if (body.action === "profile") {
    const kk = identity(field(body, "kk", 16));
    const address = field(body, "address", 250, true);
    const headId = field(body, "headId", 100);
    if (h.members.length && !h.members.some((m) => m.id === headId))
      throw new FamilyError("Pilih kepala keluarga dari anggota");
    if (!h.members.length && headId)
      throw new FamilyError("Rumah tangga belum memiliki anggota");
    h.kk = kk;
    h.address = address;
    h.headId = headId;
    return h;
  }
  if (body.action === "member") {
    if (
      !body.member ||
      typeof body.member !== "object" ||
      Array.isArray(body.member)
    )
      throw new FamilyError("Anggota tidak valid");
    const member = validateMember(body.member as Record<string, unknown>);
    const memberId = field(body, "memberId", 100);
    const index = h.members.findIndex((m) => m.id === memberId);
    if (memberId && index < 0) throw new FamilyError("Anggota tidak ditemukan");
    if (
      member.nik &&
      households.some((home) =>
        home.members.some((m) => m.nik === member.nik && m.id !== memberId),
      )
    )
      throw new FamilyError("NIK sintetis sudah digunakan");
    if (index >= 0) h.members[index] = { ...member, id: memberId };
    else h.members.push(member);
    if (!h.headId) h.headId = h.members[0].id;
    return h;
  }
  if (body.action === "move") {
    const target = households.find((x) => x.id === body.targetId);
    if (!target || !inScope(actor, target) || target.id === h.id)
      throw new FamilyError("Tujuan tidak valid atau di luar kewenangan", 403);
    const index = h.members.findIndex((m) => m.id === body.memberId);
    if (index < 0) throw new FamilyError("Anggota tidak ditemukan");
    const member = h.members[index];
    const remaining = h.members.filter((m) => m.id !== member.id);
    const replacement = field(body, "replacementHeadId", 100);
    if (
      member.id === h.headId &&
      remaining.length &&
      !remaining.some((m) => m.id === replacement)
    )
      throw new FamilyError(
        "Pilih kepala keluarga pengganti sebelum memindahkan kepala keluarga",
      );
    h.members = remaining;
    if (h.headId === member.id) h.headId = remaining.length ? replacement : "";
    target.members.push(member);
    if (!target.headId) target.headId = member.id;
    return target;
  }
  throw new FamilyError("Operasi keluarga tidak dikenal");
}
