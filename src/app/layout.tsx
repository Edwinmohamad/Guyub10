import { cookies } from "next/headers";
import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import "./os.css";
export const metadata: Metadata = {
  title: "Guyub10 — Digital Operating System RW 10",
  description: "Satu Lingkungan. Satu Portal. Semua Terhubung.",
  robots: { index: false, follow: false },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await cookies();
  return (
    <html lang="id">
      <body>
        <a className="skip-link" href="#main">
          Lewati ke konten
        </a>
        {children}
      </body>
    </html>
  );
}
