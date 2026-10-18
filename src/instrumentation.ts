export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { allowLocalRequest } = await import("./lib/local/network");
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    if (!allowLocalRequest(input))
      throw new Error(
        "Simulator lokal memblokir permintaan jaringan eksternal. Tidak ada koneksi Supabase.",
      );
    return original(input, { ...init, redirect: "error" });
  };
}
