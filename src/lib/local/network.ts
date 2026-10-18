/** The simulator permits HTTP only to the local machine, never hosted backends. */
export function allowLocalRequest(input: string | URL | Request): boolean {
  try {
    const url = new URL(
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url,
    );
    return (
      ["http:", "https:"].includes(url.protocol) &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}
