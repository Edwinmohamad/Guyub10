"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main id="main" className="wrap loading">
      <h1>Halaman belum dapat dimuat</h1>
      <p>Data lokal tetap tersimpan. Coba muat kembali.</p>
      <button className="button" onClick={reset}>
        Coba lagi
      </button>
    </main>
  );
}
