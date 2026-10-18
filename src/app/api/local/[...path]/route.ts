import {
  initialHouseholds,
  changeHouseholds,
  FamilyError,
} from "@/lib/local/households";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  transact,
  actorFrom,
  verifyPassword,
  safeUser,
  hashPassword,
  tokenHash,
  audit,
} from "@/lib/local/store";
import {
  active,
  canRead,
  canCreate,
  canManage,
  canCamera,
  inScope,
  manager,
  rwRoles,
  modules,
  publicRecord,
  transitionAllowed,
  moduleFields,
  residentFields,
  type RecordItem,
} from "@/lib/local/model";
export const runtime = "nodejs";
const cookie = "guyub_local_session";
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
function text(
  body: Record<string, unknown>,
  key: string,
  max = 200,
  required = false,
) {
  const value = body[key];
  if (value == null && !required) return "";
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  )
    throw Error(`Isian ${key} tidak valid`);
  return value.trim();
}
async function readJSON(req: NextRequest): Promise<Record<string, unknown>> {
  const reader = req.body?.getReader();
  if (!reader) throw new SyntaxError("Empty body");
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 800000) {
      await reader.cancel();
      throw new SyntaxError("Body too large");
    }
    chunks.push(value);
  }
  const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new SyntaxError("Object expected");
  return data;
}
async function handle(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const path = (await context.params).path;
    if (req.method !== "GET") {
      if (
        !req.headers.get("origin") ||
        new URL(req.headers.get("origin")!).host !== req.headers.get("host") ||
        !["http:", "https:"].includes(
          new URL(req.headers.get("origin")!).protocol,
        )
      )
        return json({ error: "Origin tidak diizinkan" }, 403);
      if (Number(req.headers.get("content-length") || 0) > 800000)
        return json({ error: "Berkas terlalu besar" }, 413);
    }
    const response = await transact(async (db) => {
      const u = actorFrom(db, req.cookies.get(cookie)?.value);
      if (path[0] === "session" && req.method === "GET")
        return json({ user: u });
      if (path[0] === "login" && req.method === "POST") {
        const body = await readJSON(req);
        const email = text(body, "email", 120, true).toLowerCase();
        const password = text(body, "password", 128, true);
        const attempt = db.attempts[email];
        if (attempt && attempt.until > Date.now() && attempt.count >= 8)
          return json(
            { error: "Terlalu banyak percobaan. Coba lagi 15 menit." },
            429,
          );
        const user = db.users.find((x) => x.email === email);
        if (
          !user ||
          !verifyPassword(password, user.password) ||
          user.status === "SUSPENDED"
        ) {
          const old = attempt && attempt.until > Date.now() ? attempt.count : 0;
          db.attempts[email] = { count: old + 1, until: Date.now() + 900000 };
          return json({ error: "Email atau kata sandi tidak valid" }, 401);
        }
        delete db.attempts[email];
        const token = randomBytes(32).toString("hex");
        db.sessions.push({
          hash: tokenHash(token),
          userId: user.id,
          expires: Date.now() + 8 * 3600000,
        });
        audit(db, safeUser(user), "LOGIN", user.id);
        const response = json({ user: safeUser(user) });
        response.cookies.set(cookie, token, {
          httpOnly: true,
          sameSite: "strict",
          secure: new URL(req.url).protocol === "https:",
          path: "/",
          maxAge: 8 * 3600,
        });
        return response;
      }
      if (path[0] === "logout" && req.method === "POST") {
        const token = req.cookies.get(cookie)?.value;
        db.sessions = db.sessions.filter(
          (s) => s.hash !== tokenHash(token || ""),
        );
        const response = json({ ok: true });
        response.cookies.delete(cookie);
        return response;
      }
      if (path[0] === "register" && req.method === "POST") {
        const body = await readJSON(req);
        const email = text(body, "email", 120, true).toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
          return json({ error: "Email tidak valid" }, 400);
        if (db.users.some((x) => x.email === email))
          return json({ error: "Email sudah terdaftar" }, 409);
        const password = text(body, "password", 128, true);
        if (password.length < 12)
          return json({ error: "Kata sandi minimal 12 karakter" }, 400);
        const rt = text(body, "rt", 2, true);
        if (!["01", "02", "03", "04"].includes(rt))
          return json({ error: "RT tidak valid" }, 400);
        const photo = text(body, "photo", 700000, true);
        const match = photo.match(
          /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/,
        );
        if (!match) return json({ error: "Foto harus PNG atau JPEG" }, 400);
        const bytes = Buffer.from(match[2], "base64");
        if (
          bytes.length > 500000 ||
          !(match[1] === "png"
            ? bytes
                .subarray(0, 8)
                .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
        )
          return json(
            { error: "Isi foto tidak valid atau lebih dari 500 KB" },
            400,
          );
        const phone = text(body, "phone", 20, true);
        if (!/^[+0-9 ()-]{8,20}$/.test(phone))
          return json({ error: "Nomor ponsel tidak valid" }, 400);
        const residentType = text(body, "residentType", 20, true);
        if (!["TETAP", "KONTRAK", "SEMENTARA"].includes(residentType))
          return json({ error: "Jenis warga tidak valid" }, 400);
        const user = {
          id: randomBytes(12).toString("hex"),
          name: text(body, "name", 100, true),
          email,
          password: hashPassword(password),
          rt,
          role: "RESIDENT" as const,
          status: "PENDING" as const,
          phone,
          address: text(body, "address", 250, true),
          residentType,
          photo,
        };
        db.users.push(user);
        audit(db, safeUser(user), "REGISTER_PENDING", user.id);
        return json(
          { ok: true, message: "Pendaftaran menunggu verifikasi admin RT." },
          201,
        );
      }
      if (path[0] === "public" && req.method === "GET")
        return json({
          records: db.records.filter((r) => canRead(null, r)).map(publicRecord),
          stats: ["01", "02", "03", "04"].map((rt) => ({
            rt,
            residents: 312,
            households: 97,
          })),
        });
      if (!u) return json({ error: "Silakan masuk" }, 401);
      if (path[0] === "me" && req.method === "GET") return json({ user: u });
      if (!active(u))
        return json(
          { error: "Akun menunggu verifikasi atau ditangguhkan" },
          403,
        );
      if (path[0] === "households") {
        if (!manager(u)) return json({ error: "Akses ditolak" }, 403);
        db.households ??= initialHouseholds(db.users);
        if (req.method === "GET")
          return json({
            households: db.households.filter((h) => inScope(u, h)),
          });
        if (req.method === "POST" || req.method === "PATCH") {
          const body = await readJSON(req);
          const household = changeHouseholds(db.households, u, body);
          audit(
            db,
            u,
            "HOUSEHOLD_" + String(body.action).toUpperCase(),
            household.id,
          );
          return json({ household }, req.method === "POST" ? 201 : 200);
        }
      }
      if (path[0] === "residents") {
        if (!manager(u)) return json({ error: "Akses ditolak" }, 403);
        if (req.method === "GET")
          return json({
            users: db.users.filter((x) => inScope(u, x)).map(safeUser),
          });
        if (req.method === "PATCH") {
          const body = await readJSON(req);
          const target = db.users.find((x) => x.id === body.id);
          const status = text(body, "status", 20, true);
          if (
            !target ||
            !inScope(u, target) ||
            (!rwRoles.includes(u.role) &&
              !["RESIDENT", "STUDENT"].includes(target.role))
          )
            return json({ error: "Akses ditolak" }, 403);
          if (!["PENDING", "VERIFIED", "ACTIVE", "SUSPENDED"].includes(status))
            return json({ error: "Status tidak valid" }, 400);
          if (target.id === u.id)
            return json(
              { error: "Status diri sendiri tidak dapat diubah" },
              400,
            );
          if (body.details) {
            const details: Record<string, string> = {};
            for (const key of Object.keys(residentFields))
              details[key] = text(
                body.details as Record<string, unknown>,
                key,
                100,
              );
            for (const key of ["nik", "kk"])
              if (details[key] && !/^0[0-9]{15}$/.test(details[key]))
                return json(
                  { error: "Gunakan identitas sintetis 16 digit diawali 0" },
                  400,
                );
            if (
              details.residentStatus &&
              ![
                "ACTIVE",
                "MOVED",
                "TEMPORARY",
                "DECEASED",
                "UNVERIFIED",
              ].includes(details.residentStatus)
            )
              return json({ error: "Status kependudukan tidak valid" }, 400);
            target.details = details;
          }
          target.status = status as typeof target.status;
          audit(db, u, "RESIDENT_" + status, target.id);
          return json({ ok: true });
        }
      }
      if (path[0] === "audit" && req.method === "GET") {
        if (!manager(u)) return json({ error: "Akses ditolak" }, 403);
        return json({
          events: db.audit
            .filter((e) => inScope(u, e))
            .slice(-100)
            .reverse(),
        });
      }
      if (path[0] === "camera" && req.method === "GET") {
        const camera = db.records.find(
          (r) => r.module === "cameras" && r.id === path[1],
        );
        if (!camera || !canCamera(u, camera))
          return json({ error: "Akses CCTV ditolak" }, 403);
        audit(db, u, "CAMERA_PREVIEW", camera.id);
        return json({
          title: camera.title,
          status: camera.status,
          preview: "STATIC_PLACEHOLDER_ONLY",
          lastCheck: new Date().toISOString(),
        });
      }
      if (path[0] === "pdf" && req.method === "GET") {
        const r = db.records.find(
          (r) => r.module === "letters" && r.id === path[1],
        );
        if (
          !r ||
          !canRead(u, r) ||
          !["PDF_READY", "ARCHIVED"].includes(r.status)
        )
          return json({ error: "PDF belum siap atau akses ditolak" }, 403);
        const pdf = await PDFDocument.create();
        const page = pdf.addPage();
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        page.drawText("GUYUB10 - CONTOH LOKAL / TIDAK BERLAKU", {
          x: 40,
          y: 780,
          size: 16,
          font,
        });
        page.drawText(`ID: ${r.id}`, { x: 40, y: 740, size: 11, font });
        page.drawText(`RT ${r.rt} | Status ${r.status}`, {
          x: 40,
          y: 715,
          size: 11,
          font,
        });
        audit(db, u, "DOWNLOAD_SAMPLE_PDF", r.id);
        return new NextResponse(new Uint8Array(await pdf.save()), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="surat-contoh.pdf"',
            "Cache-Control": "no-store",
          },
        });
      }
      if (path[0] === "records") {
        if (req.method === "GET") {
          const moduleKey = req.nextUrl.searchParams.get("module");
          const q = (req.nextUrl.searchParams.get("q") || "")
            .toLowerCase()
            .slice(0, 100);
          return json({
            records: db.records
              .filter(
                (r) =>
                  (!moduleKey || r.module === moduleKey) &&
                  canRead(u, r) &&
                  `${r.title} ${r.id} ${r.category}`.toLowerCase().includes(q),
              )
              .map((r) =>
                canManage(u, r) || r.owner === u.id ? r : publicRecord(r),
              ),
          });
        }
        const body = await readJSON(req);
        if (req.method === "POST") {
          const moduleKey = text(body, "module", 30, true),
            rt = text(body, "rt", 4, true);
          if (
            !["01", "02", "03", "04", "RW10"].includes(rt) ||
            !canCreate(u, moduleKey, rt)
          )
            return json({ error: "Akses modul atau RT ditolak" }, 403);
          const amount = Number(body.amount || 0);
          if (!Number.isFinite(amount) || amount < 0 || amount > 1e12)
            return json({ error: "Nominal tidak valid" }, 400);
          const date =
            text(body, "date", 10) || new Date().toISOString().slice(0, 10);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date)))
            return json({ error: "Tanggal tidak valid" }, 400);
          const priority = text(body, "priority", 10) || "NORMAL";
          if (!["LOW", "NORMAL", "HIGH", "URGENT"].includes(priority))
            return json({ error: "Prioritas tidak valid" }, 400);
          const privacy = text(body, "privacy", 20) || "SECURITY";
          if (
            ![
              "PUBLIC_INFO",
              "RESIDENT",
              "SECURITY",
              "RT_ADMIN",
              "RW_ADMIN",
            ].includes(privacy)
          )
            return json({ error: "Privasi tidak valid" }, 400);
          const record: RecordItem = {
            id: randomBytes(10).toString("hex"),
            module: moduleKey,
            rt,
            owner: u.id,
            title: text(body, "title", 120, true),
            description: text(body, "description", 2000),
            status: modules[moduleKey].statuses[0],
            category: text(body, "category", 40) || "UMUM",
            date,
            amount,
            priority,
            pic: text(body, "pic", 100),
            privacy,
            school: text(body, "school", 100),
            validUntil: text(body, "validUntil", 10),
            history: [
              {
                at: new Date().toISOString(),
                actor: u.id,
                status: modules[moduleKey].statuses[0],
                note: "Dibuat",
              },
            ],
          };
          if (
            moduleKey === "finance" &&
            !["INCOME", "EXPENSE"].includes(record.category)
          )
            return json(
              { error: "Kategori keuangan harus INCOME atau EXPENSE" },
              400,
            );
          if (body.data) {
            record.data = {};
            for (const key of Object.keys(moduleFields[moduleKey] || {}))
              record.data[key] = text(
                body.data as Record<string, unknown>,
                key,
                250,
              );
          }
          db.records.push(record);
          audit(db, u, "CREATE_" + moduleKey, record.id);
          return json({ record }, 201);
        }
        if (req.method === "PATCH") {
          const r = db.records.find((r) => r.id === body.id);
          const status = text(body, "status", 30, true);
          if (!r || !transitionAllowed(u, r, status))
            return json({ error: "Transisi status atau akses ditolak" }, 403);
          const note = text(body, "note", 500);
          r.status = status;
          r.history.push({
            at: new Date().toISOString(),
            actor: u.id,
            status,
            note,
          });
          audit(db, u, "STATUS_" + status, r.id);
          return json({ record: r });
        }
      }
      return json({ error: "Tidak ditemukan" }, 404);
    });
    if (req.method !== "GET" && response.ok) revalidatePath("/", "layout");
    return response;
  } catch (error) {
    if (error instanceof FamilyError)
      return json({ error: error.message }, error.status);
    if (error instanceof SyntaxError)
      return json({ error: "JSON tidak valid" }, 400);
    if (error instanceof Error && error.message.startsWith("Isian "))
      return json({ error: error.message }, 400);
    console.error(
      "Local API failure",
      error instanceof Error ? error.message : "unknown",
    );
    return json(
      { error: "Operasi gagal. Periksa input atau coba kembali." },
      500,
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
