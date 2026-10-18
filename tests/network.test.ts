import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { allowLocalRequest } from "../src/lib/local/network";
test("local simulator rejects every external fetch destination", () => {
  for (const url of [
    "https://dummy.supabase.co",
    "https://example.supabase.co/rest/v1/warga",
    "https://supabase.com",
    "https://example.com",
    "https://127.0.0.1.example.com",
    "file:///etc/passwd",
    "not-a-url",
  ])
    assert.equal(allowLocalRequest(url), false, url);
});
test("local simulator accepts only HTTP loopback hosts", () => {
  for (const url of [
    "http://127.0.0.1:3000/api/local/public",
    "http://localhost:3000",
    "http://[::1]:3000",
  ])
    assert.equal(allowLocalRequest(url), true);
  assert.ok(allowLocalRequest(new Request("http://localhost:3000")));
});
test("legacy helpers have no runtime SDK imports, URL fallbacks or credential access", async () => {
  for (const name of ["client", "server", "admin"]) {
    const source = await readFile(
      new URL(`../src/lib/supabase/${name}.ts`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(source, /process\.env|https?:|import\s*\{/);
    assert.match(source, /throw new Error/);
  }
});
test("server fetch guard blocks external URLs before invoking the network", async () => {
  const original = globalThis.fetch,
    oldRuntime = process.env.NEXT_RUNTIME;
  const calls: { url: string; redirect?: RequestRedirect }[] = [];
  try {
    process.env.NEXT_RUNTIME = "nodejs";
    globalThis.fetch = async (input, init) => {
      calls.push({ url: String(input), redirect: init?.redirect });
      return new Response("local");
    };
    const { register } = await import("../src/instrumentation");
    await register();
    await assert.rejects(
      globalThis.fetch("https://example.supabase.co/rest/v1/warga"),
      /memblokir/,
    );
    assert.equal(calls.length, 0);
    await globalThis.fetch("http://127.0.0.1:3000/api/local/public");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].redirect, "error");
  } finally {
    globalThis.fetch = original;
    if (oldRuntime === undefined) delete process.env.NEXT_RUNTIME;
    else process.env.NEXT_RUNTIME = oldRuntime;
  }
});
