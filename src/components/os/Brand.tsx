import Link from "next/link";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Guyub10 beranda">
      <span className="brand-mark">
        g<span>10</span>
      </span>
      <span>
        Guyub10<small>RW 10 · CICADAS</small>
      </span>
    </Link>
  );
}
export function Partners() {
  return (
    <div className="partners">
      <span>Supported by</span>
      <b aria-label="Placeholder logo INKAMNET">INKAMNET</b>
      <span>×</span>
      <b aria-label="Placeholder logo POKJA10">POKJA10</b>
    </div>
  );
}
export function Footer() {
  return (
    <footer className="os-footer">
      <div className="wrap">
        <Brand />
        <p>Guyub10 — Digital Operating System RW 10</p>
        <Partners />
        <p>Developed by Edwin Mohamad</p>
        <small>
          © 2026 Guyub10 — RW 10 Desa Cicadas, Gunung Putri, Kabupaten Bogor
        </small>
        <p className="muted">
          Simulator lokal · Seluruh data sintetis · Tidak terhubung ke perangkat
          atau data warga nyata
        </p>
      </div>
    </footer>
  );
}
