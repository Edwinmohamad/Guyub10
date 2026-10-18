import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canRead,
  canCreate,
  canManage,
  canCamera,
  publicRecord,
  transitionAllowed,
  type Actor,
  type Role,
  type RecordItem,
} from "../src/lib/local/model";
const actor = (
  role: Role,
  rt = "01",
  status: Actor["status"] = "ACTIVE",
): Actor => ({
  id: "a",
  name: "Synthetic",
  email: "a@guyub.test",
  role,
  rt,
  status,
  phone: "080000000",
  address: "Example",
  residentType: "TETAP",
  photo: "",
});
const record = (module = "letters", rt = "01", owner = "b"): RecordItem => ({
  id: "r",
  module,
  rt,
  owner,
  title: "Example",
  status: module === "letters" ? "SUBMITTED" : "ONLINE",
  category: "UMUM",
  description: "private notes",
  date: "2026-10-18",
  amount: 0,
  priority: "NORMAL",
  pic: "private",
  privacy: "SECURITY",
  school: "",
  validUntil: "",
  history: [],
});
test("anonymous cannot read private data, create records, or preview cameras", () => {
  for (const m of [
    "letters",
    "documents",
    "assets",
    "students",
    "tasks",
    "bookings",
    "incidents",
  ])
    assert.equal(canRead(null, record(m)), false);
  assert.equal(canCreate(null, "letters", "01"), false);
  assert.equal(canCamera(null, record("cameras")), false);
});
test("RT isolation applies to reads, writes and camera permission", () => {
  for (const role of ["KETUA_RT", "ADMIN_RT"] as Role[]) {
    const u = actor(role);
    assert.equal(canRead(u, record()), true);
    assert.equal(canRead(u, record("letters", "02")), false);
    assert.equal(canCreate(u, "finance", "02"), false);
    assert.equal(canManage(u, record("tasks", "02")), false);
    assert.equal(canCamera(u, record("cameras", "02")), false);
  }
});
test("RW roles manage all four RT", () => {
  for (const role of ["SUPER_ADMIN", "KETUA_RW", "PENGURUS_RW"] as Role[])
    for (const rt of ["01", "02", "03", "04"]) {
      const u = actor(role, "RW10");
      assert.ok(canRead(u, record("letters", rt)));
      assert.ok(canCreate(u, "tasks", rt));
      assert.ok(canCamera(u, record("cameras", rt)));
    }
});
test("resident sees only own service records and cannot approve", () => {
  const u = actor("RESIDENT");
  assert.equal(canRead(u, record()), false);
  assert.ok(canRead(u, record("letters", "01", "a")));
  assert.ok(canCreate(u, "letters", "01"));
  assert.equal(canCreate(u, "letters", "02"), false);
  assert.equal(canManage(u, record("letters", "01", "a")), false);
});
test("pending and suspended users cannot access member data", () => {
  for (const status of ["PENDING", "SUSPENDED"] as const) {
    const u = actor("SUPER_ADMIN", "RW10", status);
    assert.equal(canManage(u, record()), false);
    assert.equal(canRead(u, record("letters", "01", "a")), false);
    assert.equal(canCreate(u, "tasks", "01"), false);
    assert.equal(canCamera(u, record("cameras")), false);
  }
});
test("CCTV privacy levels prevent privilege escalation", () => {
  const r = record("cameras");
  r.privacy = "RW_ADMIN";
  assert.equal(canCamera(actor("KETUA_RT"), r), false);
  assert.equal(canCamera(actor("SECURITY"), r), false);
  r.privacy = "RT_ADMIN";
  assert.equal(canCamera(actor("SECURITY"), r), false);
  r.privacy = "SECURITY";
  assert.ok(canCamera(actor("SECURITY"), r));
  assert.equal(canCamera(actor("RESIDENT"), r), false);
  r.privacy = "RESIDENT";
  assert.ok(canCamera(actor("STUDENT"), r));
});
test("public projection strips private fields", () => {
  const p = publicRecord(record("cameras"));
  for (const key of ["owner", "description", "pic", "history", "school"])
    assert.equal(key in p, false);
});
test("letter approvals follow ordered RT and RW workflow", () => {
  const r = record();
  const rt = actor("KETUA_RT"),
    rw = actor("KETUA_RW", "RW10");
  assert.equal(transitionAllowed(rt, r, "APPROVED"), false);
  assert.ok(transitionAllowed(rt, r, "RT_REVIEW"));
  r.status = "RT_REVIEW";
  assert.ok(transitionAllowed(rt, r, "RT_APPROVED"));
  r.status = "RT_APPROVED";
  assert.equal(transitionAllowed(rt, r, "APPROVED"), false);
  assert.ok(transitionAllowed(rt, r, "RW_REVIEW"));
  r.status = "RW_REVIEW";
  assert.ok(transitionAllowed(rw, r, "APPROVED"));
  r.status = "APPROVED";
  assert.ok(transitionAllowed(rw, r, "PDF_READY"));
});
test("specialists have bounded module permissions", () => {
  assert.ok(canCreate(actor("OPERATOR"), "wifi", "01"));
  assert.equal(canCreate(actor("OPERATOR"), "finance", "01"), false);
  assert.ok(canCreate(actor("POKJA10"), "pokja", "01"));
  assert.equal(canCreate(actor("SECURITY"), "students", "01"), false);
});
