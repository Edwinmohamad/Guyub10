import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const WARGA_ACCESS_COOKIE = "guyub_warga_access";

function signingSecret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.WARGA_ACCESS_PASSWORD || "guyub-development-only";
}

export function createWargaAccessToken(password: string) {
  return createHmac("sha256", signingSecret()).update(password).digest("hex");
}

export function isValidWargaAccessToken(token: string | undefined, password: string) {
  if (!token) return false;
  const expected = createWargaAccessToken(password);
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
