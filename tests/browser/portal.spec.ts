import { test, expect, type APIRequestContext } from "@playwright/test";
const origin = "http://127.0.0.1:3000";
async function login(request: APIRequestContext, id: string) {
  const r = await request.post("/api/local/login", {
    headers: { origin },
    data: { email: id + "@guyub.test", password: "Guyub10-Lokal!" },
  });
  expect(r.status()).toBe(200);
}
test("public showcase, mobile navigation and reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Satu lingkungan",
  );
  await expect(page.getByText("Developed by Edwin Mohamad")).toBeVisible();
  for (const route of [
    "/rw10",
    "/rt/01",
    "/rt/02",
    "/rt/03",
    "/rt/04",
    "/informasi",
    "/kegiatan",
    "/fasilitas",
    "/umkm",
    "/galeri",
    "/kas",
    "/wifi",
    "/cctv",
    "/peta",
    "/darurat",
    "/pokja10",
    "/inkamnet",
  ]) {
    const r = await page.goto(route);
    expect(r?.status(), route).toBe(200);
    await expect(page.locator("main:not([aria-busy])")).toBeVisible();
  }
  await page.goto("/peta");
  await page.getByRole("button", { name: "WiFi", exact: true }).click();
  await page
    .getByRole("button", { name: /Hotspot belajar/ })
    .first()
    .click();
  await expect(page.getByText("Lokasi simulasi")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Buka navigasi" }).click();
  await expect(
    page.getByRole("navigation").getByText("Lingkungan", { exact: true }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".live-dot")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Satu lingkungan",
  );
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
});
test("anonymous blocked from resident API, CCTV and unsafe legacy endpoint", async ({
  request,
  page,
}) => {
  expect((await request.get("/api/local/residents")).status()).toBe(401);
  expect((await request.get("/api/local/camera/cameras-01-1")).status()).toBe(
    401,
  );
  expect((await request.get("/api/setup-akun")).status()).toBe(410);
  await page.goto("/command");
  await expect(page).toHaveURL(/login/);
  const data = await (await request.get("/api/local/public")).json();
  for (const r of data.records) {
    expect(r).not.toHaveProperty("owner");
    expect(r).not.toHaveProperty("history");
    expect(r).not.toHaveProperty("description");
  }
});
test("RT isolation, RW access, CSRF and server transition checks", async ({
  request,
}) => {
  await login(request, "rt01");
  const users = await (await request.get("/api/local/residents")).json();
  expect(users.users.every((u: { rt: string }) => u.rt === "01")).toBe(true);
  const records = await (
    await request.get("/api/local/records?module=letters")
  ).json();
  expect(records.records.every((r: { rt: string }) => r.rt === "01")).toBe(
    true,
  );
  expect(
    (
      await request.post("/api/local/records", {
        headers: { origin },
        data: { module: "tasks", rt: "02", title: "Forbidden" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.patch("/api/local/records", {
        headers: { origin },
        data: { id: "letters-01-0", status: "APPROVED" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/local/records", {
        headers: { origin: "https://hostile.test" },
        data: { module: "tasks", rt: "01", title: "CSRF" },
      })
    ).status(),
  ).toBe(403);
  expect((await request.get("/api/local/camera/cameras-02-1")).status()).toBe(
    403,
  );
  await login(request, "rw");
  const all = await (await request.get("/api/local/residents")).json();
  expect(new Set(all.users.map((u: { rt: string }) => u.rt)).size).toBe(5);
});
test("resident submits letter, RT and RW approve, sample PDF downloads, audit is recorded", async ({
  request,
}) => {
  await login(request, "warga01");
  const created = await request.post("/api/local/records", {
    headers: { origin },
    data: { module: "letters", title: "Surat pengujian browser", rt: "01" },
  });
  expect(created.status()).toBe(201);
  const { record } = await created.json();
  expect(
    (
      await request.patch("/api/local/records", {
        headers: { origin },
        data: { id: record.id, status: "APPROVED" },
      })
    ).status(),
  ).toBe(403);
  await login(request, "rt01");
  for (const status of ["RT_REVIEW", "RT_APPROVED", "RW_REVIEW"])
    expect(
      (
        await request.patch("/api/local/records", {
          headers: { origin },
          data: { id: record.id, status },
        })
      ).status(),
    ).toBe(200);
  await login(request, "rw");
  for (const status of ["APPROVED", "PDF_READY"])
    expect(
      (
        await request.patch("/api/local/records", {
          headers: { origin },
          data: { id: record.id, status },
        })
      ).status(),
    ).toBe(200);
  await login(request, "warga01");
  const pdf = await request.get("/api/local/pdf/" + record.id);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  await login(request, "warga02");
  expect((await request.get("/api/local/pdf/" + record.id)).status()).toBe(403);
  await login(request, "rw");
  const events = await (await request.get("/api/local/audit")).json();
  expect(
    events.events.some(
      (e: { target: string; action: string }) =>
        e.target === record.id && e.action === "STATUS_PDF_READY",
    ),
  ).toBe(true);
});
test("registration ignores role injection, pending cannot use services, scoped RT verifies", async ({
  request,
}) => {
  const email = `pending-${Date.now()}@guyub.test`;
  const body = {
    name: "Contoh Pendaftar",
    email,
    password: "Contoh-Lokal-123!",
    phone: "08000000000",
    address: "Alamat sintetis",
    rt: "02",
    residentType: "TETAP",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    photo:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  };
  expect(
    (
      await request.post("/api/local/register", {
        headers: { origin },
        data: { ...body, photo: "data:image/png;base64,ZXhlY3V0YWJsZQ==" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/local/register", {
        headers: { origin },
        data: body,
      })
    ).status(),
  ).toBe(201);
  const logged = await request.post("/api/local/login", {
    headers: { origin },
    data: { email, password: body.password },
  });
  const { user } = await logged.json();
  expect(user.role).toBe("RESIDENT");
  expect(user.status).toBe("PENDING");
  expect(
    (
      await request.post("/api/local/records", {
        headers: { origin },
        data: { module: "letters", rt: "02", title: "Blocked" },
      })
    ).status(),
  ).toBe(403);
  await login(request, "rt01");
  expect(
    (
      await request.patch("/api/local/residents", {
        headers: { origin },
        data: { id: user.id, status: "VERIFIED" },
      })
    ).status(),
  ).toBe(403);
  await login(request, "rt02");
  expect(
    (
      await request.patch("/api/local/residents", {
        headers: { origin },
        data: { id: user.id, status: "VERIFIED" },
      })
    ).status(),
  ).toBe(200);
});
test("workspace modal, filters, empty state and form submission", async ({
  page,
}) => {
  const taskTitle = `Periksa taman sintetis ${Date.now()}`;
  await page.goto("/login");
  await page.getByLabel("Pilih akun pengujian").selectOption("rw@guyub.test");
  await page.getByLabel("Kata sandi", { exact: true }).fill("Guyub10-Lokal!");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/command/);
  await page.goto("/workspace/tasks");
  await page.getByRole("button", { name: "Tambah", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Judul", { exact: true }).fill(taskTitle);
  await page.getByRole("button", { name: "Simpan contoh" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();
  await page.getByLabel("Cari data").fill("tidak-ada-hasil-xyz");
  await expect(page.getByText("Belum ada data di sini.")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("family workspace creates household, edits and moves members, and enforces RT scope", async ({
  page,
  request,
}) => {
  const memberName = `Anggota sintetis ${Date.now()}`;
  await login(request, "rt01");
  const homes = await (await request.get("/api/local/households")).json();
  expect(homes.households.every((h: { rt: string }) => h.rt === "01")).toBe(
    true,
  );
  expect(
    (
      await request.post("/api/local/households", {
        headers: { origin },
        data: { action: "create", rt: "02", address: "Forbidden" },
      })
    ).status(),
  ).toBe(403);
  await page.goto("/login");
  await page.getByLabel("Pilih akun pengujian").selectOption("rt01@guyub.test");
  await page.getByLabel("Kata sandi", { exact: true }).fill("Guyub10-Lokal!");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/command/);
  await page.goto("/residents");
  const address = `Rumah uji ${Date.now()}`;
  await page
    .getByRole("button", { name: "Tambah rumah tangga", exact: true })
    .click();
  await page
    .getByLabel("Alamat keluarga sintetis", { exact: true })
    .fill(address);
  await page
    .getByRole("button", { name: "Simpan rumah tangga", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: new RegExp(address) }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Tambah anggota", exact: true })
    .click();
  await page.getByLabel("Nama anggota", { exact: true }).fill(memberName);
  await page.getByLabel("Hubungan keluarga", { exact: true }).fill("Anak");
  await page
    .getByRole("button", { name: "Simpan anggota", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: `Edit ${memberName}`, exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: `Edit ${memberName}`, exact: true })
    .click();
  await page
    .getByLabel("Pekerjaan anggota", { exact: true })
    .fill("Pelajar contoh");
  await page
    .getByRole("button", { name: "Simpan anggota", exact: true })
    .click();
  await page
    .getByRole("button", { name: `Pindah ${memberName}`, exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Rumah tangga tujuan", exact: true })
    .selectOption(homes.households[0].id);
  await page
    .getByRole("button", { name: "Konfirmasi pemindahan", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: `Edit ${memberName}`, exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: new RegExp(homes.households[0].address) })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: `Edit ${memberName}`, exact: true }),
  ).toBeVisible();
  await login(request, "warga01");
  expect((await request.get("/api/local/households")).status()).toBe(403);
});
test("public and member testing uses no external network or Supabase", async ({
  page,
  request,
}) => {
  const external: string[] = [];
  await page.context().route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (["http:", "https:"].includes(url.protocol) && url.origin !== origin) {
      external.push(url.origin);
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Satu lingkungan",
  );
  await page.goto("/login");
  await page.getByLabel("Pilih akun pengujian").selectOption("rw@guyub.test");
  await page.getByLabel("Kata sandi", { exact: true }).fill("Guyub10-Lokal!");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page).toHaveURL(/command/);
  await page.goto("/residents");
  await expect(
    page.getByRole("heading", { name: "Rumah tangga & keluarga" }),
  ).toBeVisible();
  expect(external).toEqual([]);
  const proxy = await request.get(
    "/_next/image?url=https%3A%2F%2Fexample.supabase.co%2Fimage.png&w=640&q=75",
  );
  expect(proxy.status()).toBe(400);
});
