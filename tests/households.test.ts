import { test } from "node:test";
import assert from "node:assert/strict";
import {
  changeHouseholds,
  validateMember,
  type Household,
} from "../src/lib/local/households";
import type { Actor } from "../src/lib/local/model";
const actor: Actor = {
  id: "rt01",
  name: "Test",
  email: "test@guyub.test",
  role: "ADMIN_RT",
  rt: "01",
  status: "ACTIVE",
  phone: "",
  address: "",
  residentType: "TETAP",
  photo: "",
};
const homes = (): Household[] => [
  {
    id: "a",
    rt: "01",
    kk: "",
    address: "Contoh A",
    headId: "one",
    members: [
      { ...validateMember({ name: "Satu" }), id: "one" },
      { ...validateMember({ name: "Dua" }), id: "two" },
    ],
  },
  { id: "b", rt: "01", kk: "", address: "Contoh B", headId: "", members: [] },
  { id: "c", rt: "02", kk: "", address: "Contoh C", headId: "", members: [] },
];
test("households reject residents, suspended staff and cross-RT mutation", () => {
  for (const u of [
    { ...actor, role: "RESIDENT" as const },
    { ...actor, status: "SUSPENDED" as const },
  ])
    assert.throws(() =>
      changeHouseholds(homes(), u, {
        action: "create",
        rt: "01",
        address: "Contoh",
      }),
    );
  assert.throws(() =>
    changeHouseholds(homes(), actor, {
      action: "create",
      rt: "02",
      address: "Contoh",
    }),
  );
  assert.throws(() =>
    changeHouseholds(homes(), actor, {
      action: "member",
      id: "c",
      member: { name: "Test" },
    }),
  );
});
test("first member becomes head; updates preserve member identity", () => {
  const db = homes();
  changeHouseholds(db, actor, {
    action: "member",
    id: "b",
    member: { name: "Anak Contoh", student: true, child: true },
  });
  const id = db[1].members[0].id;
  assert.equal(db[1].headId, id);
  changeHouseholds(db, actor, {
    action: "member",
    id: "b",
    memberId: id,
    member: { name: "Nama Baru", residentStatus: "TEMPORARY" },
  });
  assert.equal(db[1].members[0].id, id);
  assert.equal(db[1].members[0].name, "Nama Baru");
});
test("head transfer requires valid replacement and is atomic on failure", () => {
  const db = homes();
  const before = structuredClone(db);
  assert.throws(() =>
    changeHouseholds(db, actor, {
      action: "move",
      id: "a",
      memberId: "one",
      targetId: "b",
    }),
  );
  assert.deepEqual(db, before);
  changeHouseholds(db, actor, {
    action: "move",
    id: "a",
    memberId: "one",
    targetId: "b",
    replacementHeadId: "two",
  });
  assert.equal(db[0].headId, "two");
  assert.equal(db[1].headId, "one");
  assert.equal(db[1].members[0].id, "one");
});
test("cross-RT move rejected for RT admin and permitted for RW", () => {
  const db = homes();
  assert.throws(() =>
    changeHouseholds(db, actor, {
      action: "move",
      id: "a",
      memberId: "two",
      targetId: "c",
    }),
  );
  changeHouseholds(
    db,
    { ...actor, role: "KETUA_RW", rt: "RW10" },
    { action: "move", id: "a", memberId: "two", targetId: "c" },
  );
  assert.equal(db[2].members[0].id, "two");
});
test("family input validates synthetic identity, dates and flags", () => {
  for (const body of [
    { name: "X", nik: "1234567890123456" },
    { name: "X", birthDate: "2025-02-31" },
    { name: "X", birthDate: "2999-01-01" },
    { name: "X", student: "true" },
    { name: "X", gender: "OTHER" },
  ])
    assert.throws(() => validateMember(body));
});
test("duplicate NIK and unknown head are rejected without mutation", () => {
  const db = homes();
  changeHouseholds(db, actor, {
    action: "member",
    id: "b",
    member: { name: "Contoh", nik: "0000000000000001" },
  });
  const before = structuredClone(db);
  assert.throws(() =>
    changeHouseholds(db, actor, {
      action: "member",
      id: "a",
      member: { name: "Duplikat", nik: "0000000000000001" },
    }),
  );
  assert.throws(() =>
    changeHouseholds(db, actor, {
      action: "profile",
      id: "a",
      address: "Contoh",
      headId: "unknown",
    }),
  );
  assert.deepEqual(db, before);
});
test("moving the last member clears the source head even with an extraneous replacement", () => {
  const db = homes();
  db[0].members = db[0].members.slice(0, 1);
  changeHouseholds(db, actor, {
    action: "move",
    id: "a",
    memberId: "one",
    targetId: "b",
    replacementHeadId: "ghost",
  });
  assert.equal(db[0].headId, "");
  assert.equal(db[0].members.length, 0);
  assert.equal(db[1].headId, "one");
});
