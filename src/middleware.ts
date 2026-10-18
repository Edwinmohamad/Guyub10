import { NextResponse, type NextRequest } from "next/server";
// This branch is an offline local simulator. Legacy routes never reach Supabase.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/local/")) return NextResponse.next();
  if (path.startsWith("/api/"))
    return NextResponse.json(
      { error: "Endpoint lama dinonaktifkan dalam mode lokal" },
      { status: 410 },
    );
  if (!["GET", "HEAD"].includes(request.method))
    return NextResponse.json(
      { error: "Gunakan API lokal yang terotorisasi" },
      { status: 405 },
    );
  if (path.startsWith("/os")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/os" + (path === "/" ? "" : path);
  return NextResponse.rewrite(url);
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)",
  ],
};
