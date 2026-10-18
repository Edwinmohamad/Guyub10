import { transact } from "../src/lib/local/store";
async function run() {
  for (let i = 0; i < 4; i++)
    await transact(async (db) => {
      const previous = db.attempts.concurrent?.count || 0;
      await new Promise((resolve) => setTimeout(resolve, 25));
      db.attempts.concurrent = { count: previous + 1, until: 0 };
    });
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
