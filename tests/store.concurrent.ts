import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
test("independent server workers preserve concurrent JSON transactions", async () => {
  const dir = await mkdtemp(join(tmpdir(), "guyub-store-test-"));
  try {
    await Promise.all(
      [1, 2, 3].map(
        () =>
          new Promise<void>((resolve, reject) => {
            const child = spawn(
              process.execPath,
              [
                "--conditions=react-server",
                "--import",
                "tsx",
                "tests/store-worker.ts",
              ],
              {
                env: { ...process.env, GUYUB_LOCAL_DATA_DIR: dir },
                stdio: ["ignore", "ignore", "pipe"],
              },
            );
            let error = "";
            child.stderr.on("data", (chunk) => (error += chunk));
            child.on("error", reject);
            child.on("exit", (code) =>
              code === 0 ? resolve() : reject(Error(error)),
            );
          }),
      ),
    );
    const db = JSON.parse(await readFile(join(dir, "database.json"), "utf8"));
    assert.equal(db.attempts.concurrent.count, 12);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
