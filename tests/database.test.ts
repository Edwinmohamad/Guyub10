import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("additive local schema is repeatable and RLS denies cross-RT and anonymous access", async () => {
  const db = new PGlite();
  try {
    const sql = await readFile(
      new URL("../database/local/001_os_schema.sql", import.meta.url),
      "utf8",
    );
    await db.exec(sql);
    await db.exec(sql);
    assert.equal(
      (
        await db.query<{ count: number }>(
          "select count(*)::int as count from guyub_local.organizations",
        )
      ).rows[0].count,
      5,
    );
    await db.exec(`insert into guyub_local.resident_profiles(id,full_name,rt,status) values ('00000000-0000-0000-0000-000000000001','RT01 example','01','ACTIVE'),('00000000-0000-0000-0000-000000000002','RT02 example','02','ACTIVE'),('00000000-0000-0000-0000-000000000003','RW example','RW10','ACTIVE');
 insert into guyub_local.user_roles values ('00000000-0000-0000-0000-000000000001','ADMIN_RT'),('00000000-0000-0000-0000-000000000003','KETUA_RW');
 insert into guyub_local.records(module,rt,title,status) values ('letters','01','RT01 letter','SUBMITTED'),('letters','02','RT02 letter','SUBMITTED');
 create role local_client nologin; grant usage on schema guyub_local to local_client; grant select on guyub_local.records to local_client; grant execute on function guyub_local.actor_id(),guyub_local.has_role(text[]),guyub_local.can_manage(text) to local_client;
 set role local_client;`);
    assert.equal(
      (await db.query("select * from guyub_local.records")).rows.length,
      0,
    );
    await db.exec(
      `select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);`,
    );
    const rt = await db.query<{ rt: string }>(
      "select rt from guyub_local.records",
    );
    assert.deepEqual(rt.rows, [{ rt: "01" }]);
    await db.exec(
      `select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false);`,
    );
    assert.equal(
      (await db.query("select * from guyub_local.records")).rows.length,
      2,
    );
    await assert.rejects(
      db.exec(
        `insert into guyub_local.user_roles values ('00000000-0000-0000-0000-000000000002','SUPER_ADMIN')`,
      ),
    );
  } finally {
    await db.close();
  }
});
