import { rename, mkdir } from "node:fs/promises";
import { join } from "node:path";
if (process.argv[2] !== "--confirm-local-reset")
  throw new Error(
    "Stop the local server first, then pass --confirm-local-reset. A backup is retained.",
  );
const dir =
  process.env.GUYUB_LOCAL_DATA_DIR || join(process.cwd(), ".local-data");
await mkdir(join(dir, "backups"), { recursive: true });
try {
  await rename(
    join(dir, "database.json"),
    join(dir, "backups", `database-${Date.now()}.json`),
  );
  console.log(
    "Synthetic state archived. The next request generates a fresh seed.",
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  console.log("No local state to reset.");
}
