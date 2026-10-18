"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Users,
  Wifi,
  Video,
  Building2,
  FileText,
  Activity,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  MapPin,
  HeartHandshake,
  Wallet,
  CheckCircle2,
  Plus,
  Download,
  LogOut,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";
import { Brand, Footer, Partners } from "./Brand";
import { Households } from "./Households";
import {
  modules,
  manager,
  active,
  rwRoles,
  canCreate,
  canManage,
  canCamera,
  transitionAllowed,
  moduleFields,
  residentFields,
  type Actor,
  type RecordItem,
} from "@/lib/local/model";
type Item = Partial<RecordItem> &
  Pick<RecordItem, "id" | "module" | "title" | "rt" | "status">;
type Event = {
  id: string;
  at: string;
  actor: string;
  rt: string;
  action: string;
  target: string;
};
type Props = {
  path: string;
  user: Actor | null;
  records: Partial<RecordItem>[];
  users: Actor[];
  events: Event[];
  today: string;
  tomorrow: string;
};
const money = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);
const nav = [
  ["/rw10", "Lingkungan"],
  ["/informasi", "Kabar warga"],
  ["/services", "Layanan"],
  ["/peta", "Peta lingkungan"],
];
const moduleLinks: Record<string, string> = {
  informasi: "news",
  kegiatan: "activities",
  fasilitas: "facilities",
  umkm: "umkm",
  galeri: "gallery",
  kas: "finance",
  wifi: "wifi",
  cctv: "cameras",
  darurat: "emergency",
  pokja10: "pokja",
  organisasi: "organization",
};
const icons = [Users, Building2, Video, Wifi];
export function Portal(props: Props) {
  const { path, user, users, events } = props;
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [rt, setRt] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [modal, setModal] = useState(false);
  const [preview, setPreview] = useState<{
    title: string;
    status: string;
    lastCheck: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [editResident, setEditResident] = useState<Actor | null>(null);
  const [recordUpdates, setRecordUpdates] = useState<Record<string, Item>>({});
  const baseRecords = props.records as Item[];
  const records = [
    ...baseRecords.map((r) => recordUpdates[r.id] || r),
    ...Object.values(recordUpdates).filter(
      (r) => !baseRecords.some((old) => old.id === r.id),
    ),
  ];
  const main = path.split("/")[0] || "";
  const isDashboard = ["command", "today", "admin", "my-rt", "warga"].includes(
    main,
  );
  const selectedModule = path.startsWith("workspace/")
    ? path.split("/")[1]
    : moduleLinks[main];
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [path]);
  async function api(endpoint: string, body: unknown, method = "POST") {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/local/" + endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Operasi gagal");
      if (data.record)
        setRecordUpdates((current) => ({
          ...current,
          [data.record.id]: data.record,
        }));
      router.refresh();
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operasi gagal");
      return null;
    } finally {
      setBusy(false);
    }
  }
  const scopeRecords = records
    .filter((r) => !month || r.date?.startsWith(month))
    .filter((r) => !year || r.data?.year === year || r.date?.startsWith(year))
    .filter((r) => rt === "ALL" || r.rt === rt)
    .filter((r) => status === "ALL" || r.status === status)
    .filter((r) =>
      `${r.title} ${r.category} ${r.id}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  const balance = records
    .filter((r) => r.module === "finance")
    .reduce(
      (sum, r) => sum + (r.category === "INCOME" ? 1 : -1) * (r.amount || 0),
      0,
    );
  const rtPage = main === "rt" ? path.split("/")[1] : null;
  const title = selectedModule
    ? modules[selectedModule]?.label
    : (
        {
          command: "RW Command Center",
          today: "Prioritas hari ini",
          "my-rt": "Ruang warga",
          residents: "Manajemen warga",
          notifications: "Pusat notifikasi",
          search: "Pencarian",
          card: "Kartu warga",
          services: "Pusat layanan",
          peta: "Peta infrastruktur",
          inkamnet: "Terhubung untuk bertumbuh",
        } as Record<string, string>
      )[main] || "Ruang bersama, langkah bersama.";
  const urgent = records.filter(
    (r) =>
      ["OFFLINE", "DEGRADED", "SUBMITTED", "PENDING", "REPORTED"].includes(
        r.status,
      ) ||
      (r.module === "tasks" &&
        r.status !== "DONE" &&
        (r.date || "") < props.today) ||
      (r.module === "activities" &&
        ["PLANNED", "ACTIVE"].includes(r.status) &&
        (r.date || "") <= props.tomorrow),
  );
  const emergency = records.find(
    (r) => r.module === "emergency" && r.status === "ACTIVE",
  );
  return (
    <>
      <div className="local-bar">
        <ShieldCheck size={13} /> LINGKUNGAN UJI LOKAL{" "}
        <span>Data sintetis · Tanpa koneksi produksi</span>
      </div>
      <header className="os-header">
        <div className="wrap header-inner">
          <Brand />
          <nav
            aria-label="Navigasi utama"
            className={mobile ? "nav open" : "nav"}
          >
            {nav.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMobile(false)}>
                {label}
              </Link>
            ))}
            <Link href="/pokja10">POKJA10</Link>
          </nav>
          <div className="header-actions">
            <Link href="/search" aria-label="Cari" className="icon-button">
              <Search size={19} />
            </Link>
            {user ? (
              <>
                <Link
                  className="button small"
                  href={manager(user) ? "/command" : "/my-rt"}
                >
                  Ruang saya <ArrowUpRight size={14} />
                </Link>
                <button
                  aria-label="Keluar"
                  className="icon-button"
                  onClick={async () => {
                    if (await api("logout", {})) router.push("/");
                  }}
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <Link className="button small" href="/login">
                Masuk warga <ArrowUpRight size={14} />
              </Link>
            )}
            <button
              className="menu-button icon-button"
              aria-label="Buka navigasi"
              aria-expanded={mobile}
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {emergency && (
        <div className="emergency-banner" role="alert">
          SIMULASI DARURAT · {emergency.title} · Hubungi pengurus setempat.
          Bukan kejadian nyata.
        </div>
      )}
      <main id="main">
        {(error || message) && (
          <div
            className={"wrap notice " + (error ? "error" : "")}
            role={error ? "alert" : "status"}
          >
            {error || message}
            <button
              aria-label="Tutup pesan"
              onClick={() => {
                setError("");
                setMessage("");
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {["login", "daftar"].includes(main) ? (
          <Auth register={main === "daftar"} api={api} busy={busy} />
        ) : main === "" ? (
          <>
            <section className="hero">
              <div className="wrap hero-grid">
                <div className="hero-copy">
                  <p className="eyebrow">
                    <span className="live-dot" /> DARI WARGA, UNTUK WARGA
                  </p>
                  <h1>
                    Satu lingkungan.
                    <br />
                    Banyak cerita.
                    <br />
                    <em>Semua terhubung.</em>
                  </h1>
                  <p className="hero-description">
                    Selamat datang di ruang digital RW 10. Tempat kabar baik
                    dibagikan, layanan dipermudah, dan kepedulian menjadi aksi
                    bersama.
                  </p>
                  <div className="button-row">
                    <Link className="button" href="/rw10">
                      Jelajahi lingkungan <ArrowUpRight size={17} />
                    </Link>
                    <Link className="text-link" href="/services">
                      Layanan warga <ArrowRight size={17} />
                    </Link>
                  </div>
                  <div className="hero-note">
                    <div className="avatars">
                      <span>01</span>
                      <span>02</span>
                      <span>03</span>
                      <span>04</span>
                    </div>
                    <p>
                      Empat RT. Satu rumah bersama.
                      <small>Desa Cicadas · Gunung Putri · Bogor</small>
                    </p>
                  </div>
                </div>
                <HeroScene />
              </div>
              <div className="wrap stats-strip">
                {[
                  ["4", "RT terhubung"],
                  ["1.248", "Warga · simulasi"],
                  ["387", "Keluarga · simulasi"],
                  ["24", "Titik CCTV · simulasi"],
                ].map(([n, l], i) => {
                  const Icon = icons[i];
                  return (
                    <div key={l}>
                      <Icon size={20} />
                      <Counter value={n} />
                      <span>{l}</span>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="wrap section reveal">
              <SectionHead
                kicker="LINGKUNGAN KITA"
                title="Dekat dengan tetangga. Terhubung dengan lingkungan."
                href="/rw10"
                link="Kenali RW 10"
              />
              <div className="rt-grid">
                {["01", "02", "03", "04"].map((n, i) => (
                  <Link href={"/rt/" + n} className="rt-card" key={n}>
                    <div className={"rt-art art-" + i}>
                      <Building2 size={72} strokeWidth={0.8} />
                      <span>RUKUN TETANGGA</span>
                      <strong>{n}</strong>
                    </div>
                    <div className="rt-card-body">
                      <h3>
                        RT {n}
                        <ArrowUpRight size={18} />
                      </h3>
                      <p>Ruang cerita & layanan lingkungan</p>
                      <div className="rt-meta">
                        <span>
                          <span className="live-dot" /> Aktif
                        </span>
                        <span>312 warga contoh</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            <section className="services-band">
              <div className="wrap section reveal">
                <SectionHead
                  kicker="LEBIH MUDAH, LEBIH DEKAT"
                  title="Kebutuhan warga, dalam satu portal."
                />
                <ServiceCards />
              </div>
            </section>
            <section className="wrap section reveal">
              <SectionHead
                kicker="KABAR DARI LINGKUNGAN"
                title="Hal kecil. Dampak bersama."
                href="/informasi"
                link="Semua kabar"
              />
              <div className="news-carousel">
                {records
                  .filter((r) => r.module === "news")
                  .slice(0, 6)
                  .map((r, i) => (
                    <Link key={r.id} href="/informasi" className="news-card">
                      <div className={"news-art news-" + (i % 3)}>
                        <HeartHandshake size={56} strokeWidth={1} />
                        <span>GUYUB / CERITA WARGA</span>
                      </div>
                      <div>
                        <p className="eyebrow">RT {r.rt} · KABAR LINGKUNGAN</p>
                        <h3>{r.title}</h3>
                        <p>
                          Bergerak bersama untuk lingkungan yang lebih nyaman.
                        </p>
                        <span className="text-link">
                          Baca kabar <ArrowUpRight size={16} />
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
            <section className="wrap section reveal">
              <div className="connected">
                <div>
                  <p className="eyebrow">INFRASTRUKTUR UNTUK SEMUA</p>
                  <h2>
                    Lingkungan aman.
                    <br />
                    Belajar tanpa batas.
                  </h2>
                  <p>
                    Pantau status sarana lingkungan dan kenali WiFi Pelajar.
                    Informasi terbuka, privasi tetap terjaga.
                  </p>
                  <Link className="button light" href="/peta">
                    Lihat peta lingkungan <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className="connect-panels">
                  <Link href="/cctv">
                    <Video />
                    <strong>CCTV lingkungan</strong>
                    <span>Informasi lokasi & status saja</span>
                    <ArrowUpRight />
                  </Link>
                  <Link href="/wifi">
                    <Wifi />
                    <strong>WiFi Pelajar</strong>
                    <span>Ruang belajar yang terhubung</span>
                    <ArrowUpRight />
                  </Link>
                </div>
              </div>
            </section>
            <section className="wrap section reveal community">
              <p className="eyebrow">TUMBUH BERSAMA</p>
              <h2>
                Energi baik dimulai
                <br />
                dari lingkungan sendiri.
              </h2>
              <p>
                Bersama POKJA10 dan dukungan INKAMNET, kita membangun ruang
                untuk belajar, berkarya, dan saling menjaga.
              </p>
              <Partners />
              <Link href="/pokja10" className="text-link">
                Kenali POKJA10 <ArrowUpRight size={16} />
              </Link>
            </section>
          </>
        ) : ["rw10", "profil", "rt"].includes(main) ? (
          <>
            <div className="page-hero">
              <div className="wrap">
                <p className="eyebrow">
                  RUMAH BERSAMA · {rtPage ? "RT " + rtPage : "RW 10"}
                </p>
                <h1>
                  {rtPage
                    ? "Cerita dan langkah RT " + rtPage
                    : "Mengenal RW 10."}
                </h1>
                <p>Satu Lingkungan. Satu Portal. Semua Terhubung.</p>
              </div>
            </div>
            <div className="wrap section">
              <div className="profile-grid">
                <article className="panel">
                  <h2>Selamat datang, tetangga.</h2>
                  <p>
                    Ruang kolaborasi warga Desa Cicadas untuk lingkungan yang
                    aman, tertib, dan saling mendukung.
                  </p>
                  <h3>Visi & misi</h3>
                  <p>
                    Pelayanan yang inklusif, informasi yang transparan, serta
                    sarana belajar dan berkarya yang mudah dijangkau.
                  </p>
                </article>
                <article className="panel">
                  <div className="avatar large">{rtPage || "10"}</div>
                  <h3>Ketua {rtPage ? "RT " + rtPage : "RW 10"}</h3>
                  <p>Pengurus Contoh · Periode 2026–2029</p>
                  <small>Profil sintetis · Kontak melalui pusat layanan</small>
                </article>
              </div>
              <SectionHead kicker="ORGANISASI" title="Bekerja bersama warga." />
              <div className="org-chart">
                {["Ketua", "Sekretaris", "Bendahara", "Seksi pelayanan"].map(
                  (p, i) => (
                    <div className="panel" key={p}>
                      <span className="avatar">{i + 1}</span>
                      <h3>{p}</h3>
                      <p>Pengurus Contoh {i + 1}</p>
                      <small>Koordinasi & pelayanan · 2026–2029</small>
                    </div>
                  ),
                )}
              </div>
              <div className="stats-strip">
                {[
                  ["312", "Warga contoh"],
                  ["97", "Keluarga contoh"],
                  ["6", "Kamera contoh"],
                  ["1", "Hotspot contoh"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <strong>{n}</strong>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
              {Object.entries(moduleLinks)
                .filter(([k]) => !["organisasi", "darurat"].includes(k))
                .map(([link, module]) => (
                  <section className="profile-section" key={module}>
                    <SectionHead
                      kicker={rtPage ? "RT " + rtPage : "RW 10"}
                      title={modules[module].label}
                      href={"/" + link}
                      link="Selengkapnya"
                    />
                    <RecordCards
                      records={records
                        .filter(
                          (r) =>
                            r.module === module && (!rtPage || r.rt === rtPage),
                        )
                        .slice(0, 4)}
                    />
                  </section>
                ))}
              <Link href="/peta" className="button">
                Peta lingkungan <MapPin size={17} />
              </Link>
              <Link href="/darurat" className="text-link">
                Kontak darurat <ArrowRight size={17} />
              </Link>
            </div>
          </>
        ) : (
          <div
            className={
              isDashboard ||
              [
                "workspace",
                "residents",
                "notifications",
                "card",
                "search",
              ].includes(main)
                ? "workspace wrap"
                : "wrap section"
            }
          >
            {user && (
              <aside className="sidebar">
                <p className="eyebrow">
                  RUANG {manager(user) ? "PENGURUS" : "WARGA"}
                </p>
                <div className="user-chip">
                  <span className="avatar">{user.name.slice(0, 1)}</span>
                  <div>
                    <strong>{user.name}</strong>
                    <small>
                      {user.role} ·{" "}
                      {user.rt === "RW10" ? "RW 10" : "RT " + user.rt}
                    </small>
                  </div>
                </div>
                <Link href={manager(user) ? "/command" : "/my-rt"}>
                  <LayoutDashboard size={17} /> Ringkasan
                </Link>
                <Link href="/today">
                  <Activity size={17} /> Today
                </Link>
                <Link href="/services">
                  <FileText size={17} /> Pusat layanan
                </Link>
                {manager(user) && (
                  <Link href="/residents">
                    <Users size={17} /> Data warga
                  </Link>
                )}
                <Link href="/card">
                  <ShieldCheck size={17} /> Kartu warga
                </Link>
                <Link href="/notifications">
                  <Bell size={17} /> Notifikasi
                </Link>
                <Link href="/search">
                  <Search size={17} /> Pencarian
                </Link>
                <div className="sidebar-divider" />
                {Object.entries(modules).map(([key, m]) => (
                  <Link key={key} href={"/workspace/" + key}>
                    <ChevronRight size={14} />
                    {m.label}
                  </Link>
                ))}
              </aside>
            )}
            <div className="workspace-main">
              <div className="page-heading">
                <div>
                  <p className="eyebrow">
                    {user ? "RUANG ANDA · " + user.status : "JELAJAHI GUYUB10"}
                  </p>
                  <h1>{title}</h1>
                  <p>
                    Informasi terhubung. Aksi yang berarti. Seluruh data di
                    halaman ini adalah simulasi.
                  </p>
                </div>
                {selectedModule &&
                  active(user) &&
                  canCreate(
                    user,
                    selectedModule,
                    rwRoles.includes(user.role) ? "RW10" : user.rt,
                  ) && (
                    <button className="button" onClick={() => setModal(true)}>
                      <Plus size={17} /> Tambah
                    </button>
                  )}
              </div>
              {user && !active(user) ? (
                <div className="empty">
                  <ShieldCheck size={40} />
                  <h2>Pendaftaran sedang ditinjau.</h2>
                  <p>
                    Admin RT akan memverifikasi pendaftaran Anda. Fitur anggota
                    belum dapat diakses.
                  </p>
                </div>
              ) : isDashboard ||
                main === "notifications" ||
                main === "today" ? (
                <>
                  <div className="metric-grid">
                    {[
                      [Users, "Warga contoh", "1.248"],
                      [Building2, "Keluarga contoh", "387"],
                      [
                        Video,
                        "CCTV online",
                        `${records.filter((r) => r.module === "cameras" && r.status === "ONLINE").length}/${records.filter((r) => r.module === "cameras").length}`,
                      ],
                      [Wallet, "Saldo transparansi", money(balance)],
                    ].map(([Icon, label, value]) => {
                      const I = Icon as typeof Users;
                      return (
                        <div className="metric" key={String(label)}>
                          <I size={20} />
                          <span>{String(label)}</span>
                          <strong>{String(value)}</strong>
                        </div>
                      );
                    })}
                  </div>
                  <div className="dashboard-grid">
                    <section className="panel">
                      <div className="section-title">
                        <h2>
                          <span className="live-dot" /> Today
                        </h2>
                        <span className="badge">
                          {urgent.length} perlu perhatian
                        </span>
                      </div>
                      {urgent.slice(0, 10).map((r) => (
                        <Link
                          className="activity-row"
                          key={r.id}
                          href={"/workspace/" + r.module}
                        >
                          <span className="activity-icon">
                            <ClipboardList size={18} />
                          </span>
                          <div>
                            <strong>{r.title}</strong>
                            <small>
                              RT {r.rt} · {modules[r.module]?.label} · {r.date}
                            </small>
                          </div>
                          <Status value={r.status} />
                        </Link>
                      ))}
                      {!urgent.length && (
                        <p className="empty">Semua sudah tertangani.</p>
                      )}
                    </section>
                    <section className="panel">
                      <h2>Langkah berikutnya</h2>
                      <ServiceCards compact />
                      <h3>Verifikasi warga</h3>
                      <p>
                        {users.filter((u) => u.status === "PENDING").length}{" "}
                        pendaftaran menunggu tinjauan.
                      </p>
                      <h3>Aktivitas terbaru</h3>
                      {events.slice(0, 6).map((e) => (
                        <p className="audit-event" key={e.id}>
                          <strong>{e.action.replaceAll("_", " ")}</strong>
                          <small>
                            {e.actor} · {new Date(e.at).toLocaleString("id-ID")}
                          </small>
                        </p>
                      ))}
                      {!events.length && <p>Belum ada aktivitas internal.</p>}
                      <Link href="/card" className="text-link">
                        Lihat kartu warga <ArrowRight size={16} />
                      </Link>
                    </section>
                  </div>
                  <h2>
                    Lingkungan saya ·{" "}
                    {user?.rt === "RW10" ? "4 RT" : `RT ${user?.rt}`}
                  </h2>
                  <RecordCards
                    records={records
                      .filter(
                        (r) =>
                          ["activities", "news", "projects"].includes(
                            r.module,
                          ) &&
                          (!user ||
                            rwRoles.includes(user.role) ||
                            r.rt === user.rt),
                      )
                      .slice(0, 6)}
                  />
                </>
              ) : main === "residents" ? (
                <>
                  <Households user={user!} />
                  <Filters
                    query={query}
                    setQuery={setQuery}
                    rt={rt}
                    setRt={setRt}
                    status={status}
                    setStatus={setStatus}
                    statuses={["PENDING", "VERIFIED", "ACTIVE", "SUSPENDED"]}
                  />
                  <div className="table-scroll">
                    <table>
                      <caption>Warga sintetis dalam cakupan peran Anda</caption>
                      <thead>
                        <tr>
                          <th>Warga</th>
                          <th>RT</th>
                          <th>Peran</th>
                          <th>Status</th>
                          <th>Tindakan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter(
                            (u) =>
                              (rt === "ALL" || u.rt === rt) &&
                              (status === "ALL" || u.status === status) &&
                              `${u.name} ${u.email}`
                                .toLowerCase()
                                .includes(query.toLowerCase()),
                          )
                          .map((u) => (
                            <tr key={u.id}>
                              <td>
                                <button
                                  className="text-link"
                                  onClick={() => setEditResident(u)}
                                >
                                  {u.name}
                                </button>
                                <small>
                                  {u.email}
                                  <br />
                                  {u.phone} · {u.address}
                                </small>
                              </td>
                              <td>{u.rt}</td>
                              <td>{u.role}</td>
                              <td>
                                <Status value={u.status} />
                              </td>
                              <td>
                                {u.id !== user?.id && (
                                  <select
                                    aria-label={"Ubah status " + u.name}
                                    value={u.status}
                                    onChange={async (e) => {
                                      await api(
                                        "residents",
                                        { id: u.id, status: e.target.value },
                                        "PATCH",
                                      );
                                    }}
                                  >
                                    {[
                                      "PENDING",
                                      "VERIFIED",
                                      "ACTIVE",
                                      "SUSPENDED",
                                    ].map((s) => (
                                      <option key={s}>{s}</option>
                                    ))}
                                  </select>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="muted">
                    Data pribadi hanya tersedia bagi pengurus yang berwenang.
                    Semua identitas di sini sintetis.
                  </p>
                </>
              ) : main === "card" ? (
                <div className="resident-card">
                  <div className="card-top">
                    <Brand />
                    <Status value={user?.status || "PENDING"} />
                  </div>
                  <p className="eyebrow">KARTU WARGA DIGITAL · CONTOH</p>
                  <div className="card-person">
                    <div className="avatar large">{user?.name.slice(0, 1)}</div>
                    <div>
                      <h2>{user?.name}</h2>
                      <p>RW 10 · RT {user?.rt}</p>
                      <small>ID {user?.id}</small>
                    </div>
                    <div
                      className="qr-placeholder"
                      aria-label="Placeholder QR, tidak dapat dipindai"
                    >
                      ▦<small>QR DEMO</small>
                    </div>
                  </div>
                  <p>Satu Lingkungan. Satu Portal. Semua Terhubung.</p>
                </div>
              ) : main === "services" ||
                ["layanan", "aspirasi", "laporan"].includes(main) ? (
                <>
                  <ServiceCards />
                  <h2>Riwayat layanan saya</h2>
                  <RecordCards
                    records={records.filter(
                      (r) =>
                        r.owner === user?.id &&
                        [
                          "letters",
                          "incidents",
                          "bookings",
                          "students",
                          "umkm",
                        ].includes(r.module),
                    )}
                  />
                </>
              ) : main === "peta" ? (
                <MapPanel records={records} />
              ) : main === "inkamnet" ? (
                <div className="panel">
                  <Wifi size={40} />
                  <h2>INKAMNET × Guyub10</h2>
                  <p>
                    Dukungan konektivitas untuk layanan lingkungan dan ruang
                    belajar. Semua perangkat pada simulator ini fiktif; tidak
                    ada koneksi MikroTik atau jaringan produksi.
                  </p>
                  <Partners />
                </div>
              ) : main === "search" ? (
                <>
                  {manager(user) && (
                    <section className="panel">
                      <h2>Warga dalam cakupan Anda</h2>
                      {users
                        .filter((u) =>
                          `${u.name} ${u.email} ${u.id}`
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                        )
                        .map((u) => (
                          <Link
                            className="activity-row"
                            href="/residents"
                            key={u.id}
                          >
                            {u.name} · RT {u.rt}
                            <Status value={u.status} />
                          </Link>
                        ))}
                    </section>
                  )}
                  <label className="search-box">
                    <Search size={20} />
                    <input
                      placeholder="Cari surat, layanan, kegiatan, UMKM, dokumen…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <RecordCards records={scopeRecords.slice(0, 40)} />
                  <p className="muted">
                    Hasil disaring di server berdasarkan peran, kepemilikan, dan
                    cakupan RT.
                  </p>
                </>
              ) : selectedModule && modules[selectedModule] ? (
                <>
                  {selectedModule === "emergency" && (
                    <section className="panel">
                      <h2>Kontak darurat umum</h2>
                      <p>
                        112 · Layanan darurat umum | 110 · Kepolisian | 113 ·
                        Pemadam kebakaran
                      </p>
                      <p>
                        Periksa ketersediaan layanan di wilayah Anda. Jangan
                        melakukan panggilan untuk pengujian simulator.
                      </p>
                    </section>
                  )}
                  {selectedModule === "cameras" && (
                    <div className="notice">
                      <ShieldCheck size={20} />
                      <p>
                        Publik hanya melihat lokasi dan status. Pratinjau
                        anggota berupa placeholder statis. Tidak ada RTSP, IP,
                        atau kredensial perangkat.
                      </p>
                    </div>
                  )}
                  {selectedModule === "wifi" && (
                    <div className="notice">
                      <Wifi size={22} />
                      <p>
                        WiFi Pelajar · Hotspot dan penggunaan disimulasikan.
                        Ajukan akses melalui pusat layanan.
                      </p>
                      <Link href="/workspace/students" className="text-link">
                        Daftar akses <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  )}
                  {selectedModule === "finance" && (
                    <div className="finance-summary">
                      <span>Saldo entitas yang ditampilkan</span>
                      <strong>
                        {money(
                          scopeRecords
                            .filter((r) => r.module === "finance")
                            .reduce(
                              (s, r) =>
                                s +
                                (r.category === "INCOME" ? 1 : -1) *
                                  (r.amount || 0),
                              0,
                            ),
                        )}
                      </strong>
                      <p>
                        Ringkasan transaksi sintetis. Bukti dan catatan internal
                        tidak tersedia untuk publik.
                      </p>
                    </div>
                  )}
                  {selectedModule === "finance" && (
                    <label className="month-filter">
                      Rekap bulanan
                      <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                      />
                    </label>
                  )}
                  {selectedModule === "documents" && (
                    <label className="month-filter">
                      Tahun arsip
                      <input
                        type="number"
                        placeholder="Semua tahun"
                        min="2000"
                        max="2100"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      />
                    </label>
                  )}
                  <Filters
                    query={query}
                    setQuery={setQuery}
                    rt={rt}
                    setRt={setRt}
                    status={status}
                    setStatus={setStatus}
                    statuses={modules[selectedModule].statuses}
                  />
                  {scopeRecords.filter((r) => r.module === selectedModule)
                    .length ? (
                    <div className="record-grid">
                      {scopeRecords
                        .filter((r) => r.module === selectedModule)
                        .map((r) => (
                          <article className="panel record" key={r.id}>
                            <div className="record-top">
                              <span className="eyebrow">
                                {r.rt === "RW10" ? "RW 10" : "RT " + r.rt} ·{" "}
                                {r.category}
                              </span>
                              <Status value={r.status} />
                            </div>
                            <h3>{r.title}</h3>
                            {r.description && <p>{r.description}</p>}
                            <small>
                              {r.date}
                              {r.pic ? " · PIC " + r.pic : ""}
                            </small>
                            {r.module === "finance" && (
                              <strong className="amount">
                                {money(r.amount || 0)}
                              </strong>
                            )}
                            {r.data && (
                              <dl className="record-details">
                                {Object.entries(r.data)
                                  .filter(([, v]) => v)
                                  .map(([key, value]) => (
                                    <div key={key}>
                                      <dt>
                                        {moduleFields[r.module]?.[key] || key}
                                      </dt>
                                      <dd>{value}</dd>
                                    </div>
                                  ))}
                              </dl>
                            )}
                            {r.school && r.module === "students" && (
                              <p>
                                {r.school} · Berlaku hingga{" "}
                                {r.validUntil || "belum ditetapkan"}
                              </p>
                            )}
                            {r.module === "cameras" &&
                              canCamera(user, r as RecordItem) && (
                                <button
                                  className="button secondary"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(
                                        "/api/local/camera/" + r.id,
                                      );
                                      const data = await response.json();
                                      if (!response.ok) throw Error(data.error);
                                      setPreview(data);
                                    } catch (e) {
                                      setError((e as Error).message);
                                    }
                                  }}
                                >
                                  Pratinjau aman <Video size={16} />
                                </button>
                              )}
                            {["PDF_READY", "ARCHIVED"].includes(r.status) &&
                              r.module === "letters" && (
                                <a
                                  className="button secondary"
                                  href={"/api/local/pdf/" + r.id}
                                >
                                  <Download size={16} /> PDF contoh
                                </a>
                              )}
                            {canManage(user, r as RecordItem) && (
                              <div className="record-actions">
                                {modules[selectedModule].statuses
                                  .filter((s) =>
                                    transitionAllowed(
                                      user!,
                                      r as RecordItem,
                                      s,
                                    ),
                                  )
                                  .map((s) => (
                                    <button
                                      disabled={busy}
                                      key={s}
                                      className="mini-button"
                                      onClick={() =>
                                        api(
                                          "records",
                                          {
                                            id: r.id,
                                            status: s,
                                            note: "Diperbarui dari workspace lokal",
                                          },
                                          "PATCH",
                                        )
                                      }
                                    >
                                      {s.replaceAll("_", " ")}{" "}
                                      <ArrowRight size={12} />
                                    </button>
                                  ))}
                              </div>
                            )}
                            {r.history && (
                              <details>
                                <summary>Riwayat ({r.history.length})</summary>
                                {r.history.map((h, i) => (
                                  <p key={i}>
                                    <small>
                                      {h.at} · {h.actor}
                                    </small>
                                    <br />
                                    {h.status} · {h.note}
                                  </p>
                                ))}
                              </details>
                            )}
                          </article>
                        ))}
                    </div>
                  ) : (
                    <Empty />
                  )}
                  {selectedModule === "pokja" && (
                    <div className="panel">
                      <h2>POKJA10 Community Hub</h2>
                      <p>
                        Ruang relawan, aktivitas pemuda, dokumentasi, dan proyek
                        komunitas.
                      </p>
                      <Link className="button" href="/daftar">
                        Pendaftaran anggota · contoh <ArrowRight size={16} />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <Empty />
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
      {modal && selectedModule && (
        <Dialog
          title={"Tambah " + modules[selectedModule]?.label}
          close={() => setModal(false)}
        >
          <RecordForm
            module={selectedModule}
            user={user!}
            busy={busy}
            submit={async (body) => {
              if (await api("records", body)) {
                setModal(false);
                setMessage("Data contoh berhasil disimpan.");
              }
            }}
          />
        </Dialog>
      )}
      {editResident && (
        <Dialog
          title="Profil warga · data sintetis"
          close={() => setEditResident(null)}
        >
          <form
            className="form"
            onSubmit={async (e) => {
              e.preventDefault();
              const details = Object.fromEntries(new FormData(e.currentTarget));
              if (
                await api(
                  "residents",
                  { id: editResident.id, status: editResident.status, details },
                  "PATCH",
                )
              )
                setEditResident(null);
            }}
          >
            <p>
              {editResident.name} · RT {editResident.rt}
            </p>
            {Object.entries(residentFields).map(([key, label]) => (
              <label key={key}>
                {label}
                {key === "residentStatus" ? (
                  <select
                    name={key}
                    defaultValue={editResident.details?.[key] || "UNVERIFIED"}
                  >
                    {[
                      "ACTIVE",
                      "MOVED",
                      "TEMPORARY",
                      "DECEASED",
                      "UNVERIFIED",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={key}
                    maxLength={100}
                    defaultValue={editResident.details?.[key] || ""}
                  />
                )}
              </label>
            ))}
            <button className="button" disabled={busy}>
              Simpan profil sintetis
            </button>
          </form>
        </Dialog>
      )}
      {preview && (
        <Dialog title="Pratinjau CCTV aman" close={() => setPreview(null)}>
          <div className="camera-placeholder">
            <Video size={50} />
            <strong>{preview.title}</strong>
            <span>{preview.status}</span>
            <p>PLACEHOLDER STATIS · TANPA STREAM</p>
            <small>
              Pemeriksaan simulasi:{" "}
              {new Date(preview.lastCheck).toLocaleString("id-ID")}
            </small>
          </div>
        </Dialog>
      )}
    </>
  );
}
function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const target = Number(value.replaceAll(".", ""));
      const start = performance.now();
      let id: number;
      const tick = (time: number) => {
        const p = Math.min((time - start) / 900, 1);
        el.textContent = Math.round(
          target * (1 - Math.pow(1 - p, 3)),
        ).toLocaleString("id-ID");
        if (p < 1) id = requestAnimationFrame(tick);
      };
      id = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(id);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return <strong ref={ref}>{value}</strong>;
}
function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      className="hero-scene"
      ref={ref}
      onPointerMove={(e) => {
        if (
          matchMedia("(prefers-reduced-motion: reduce)").matches ||
          e.pointerType !== "mouse"
        )
          return;
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty(
          "--tilt",
          `${((e.clientX - rect.left) / rect.width - 0.5) * 5}deg`,
        );
      }}
      onPointerLeave={(e) =>
        e.currentTarget.style.setProperty("--tilt", "0deg")
      }
    >
      <div className="scene-label">
        <span className="live-dot" /> CICADAS, RUMAH KITA{" "}
        <ArrowUpRight size={15} />
      </div>
      <svg
        viewBox="0 0 600 500"
        role="img"
        aria-label="Ilustrasi lingkungan RW 10 yang hijau dan terhubung"
      >
        <rect width="600" height="500" fill="#e6e9df" />
        <circle cx="470" cy="115" r="58" fill="#e6c98a" />
        <path d="M0 310 Q150 230 300 280 T600 240 V500 H0Z" fill="#bcc9ae" />
        <path d="M0 400 Q180 300 600 400 V500 H0Z" fill="#91a78c" />
        <path d="M320 500L215 280H265L440 500Z" fill="#eee9da" />
        <path
          d="M350 500L237 280"
          stroke="#d0cabb"
          strokeWidth="2"
          strokeDasharray="10 10"
        />
        {[
          [85, 240, 90],
          [320, 190, 110],
          [430, 300, 100],
          [120, 355, 80],
        ].map(([x, y, w], i) => (
          <g key={i}>
            <path
              d={`M${x - 10} ${y}L${x + w / 2} ${y - 55}L${x + w + 10} ${y}Z`}
              fill={i % 2 ? "#435452" : "#a87050"}
            />
            <rect
              x={x}
              y={y}
              width={w}
              height={w * 0.65}
              fill={i % 2 ? "#f5f0e3" : "#dedbc9"}
            />
            <rect
              x={x + w * 0.4}
              y={y + w * 0.22}
              width={w * 0.22}
              height={w * 0.43}
              fill="#566666"
            />
            <rect
              x={x + w * 0.1}
              y={y + w * 0.15}
              width={w * 0.19}
              height={w * 0.23}
              fill="#91a8a1"
            />
          </g>
        ))}
        {[
          [45, 330],
          [280, 230],
          [510, 260],
          [390, 390],
          [70, 440],
        ].map(([x, y], i) => (
          <g key={i}>
            <path d={`M${x} ${y}v50`} stroke="#7c8060" strokeWidth="6" />
            <ellipse
              cx={x}
              cy={y - 7}
              rx="26"
              ry="43"
              fill={i % 2 ? "#506f5a" : "#759478"}
            />
          </g>
        ))}
        <path d="M0 490H600" stroke="#c9cabc" strokeWidth="20" />
      </svg>
      <div className="scene-card">
        <span className="scene-icon">
          <HeartHandshake size={24} />
        </span>
        <div>
          <strong>Lingkungan yang saling menjaga.</strong>
          <small>Bersama, setiap hari jadi lebih berarti.</small>
        </div>
      </div>
      <span className="scene-caption">01 / RUANG HIDUP, RUANG TUMBUH</span>
    </div>
  );
}
function SectionHead({
  kicker,
  title,
  href,
  link,
}: {
  kicker: string;
  title: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-link">
          {link}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
function ServiceCards({ compact = false }: { compact?: boolean }) {
  const cards = [
    ["letters", "Surat & administrasi", "Ajukan, pantau, unduh.", FileText],
    ["incidents", "Lapor lingkungan", "Kepedulian menjadi aksi.", Activity],
    [
      "bookings",
      "Pinjam fasilitas",
      "Ruang untuk kegiatan bersama.",
      Building2,
    ],
    ["students", "WiFi Pelajar", "Terhubung untuk belajar.", Wifi],
  ] as const;
  return (
    <div className={compact ? "service-grid compact" : "service-grid"}>
      {cards.map(([key, title, desc, Icon]) => (
        <Link className="service-card" href={"/workspace/" + key} key={key}>
          <Icon size={25} strokeWidth={1.5} />
          <h3>{title}</h3>
          <p>{desc}</p>
          <ArrowUpRight className="service-arrow" size={18} />
        </Link>
      ))}
    </div>
  );
}
function Status({ value }: { value: string }) {
  return (
    <span
      className={
        "badge " +
        ([
          "ACTIVE",
          "ONLINE",
          "APPROVED",
          "DONE",
          "VERIFIED",
          "AVAILABLE",
          "GOOD",
          "PUBLISHED",
        ].includes(value)
          ? "good"
          : ["OFFLINE", "SUSPENDED", "URGENT"].includes(value)
            ? "bad"
            : "")
      }
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
function Empty() {
  return (
    <div className="empty">
      <ClipboardList size={34} />
      <h3>Belum ada data di sini.</h3>
      <p>
        Coba filter lain atau tambahkan data contoh jika Anda memiliki akses.
      </p>
    </div>
  );
}
function RecordCards({ records }: { records: Item[] }) {
  return records.length ? (
    <div className="record-grid">
      {records.map((r) => (
        <Link
          href={"/workspace/" + r.module}
          className="panel record"
          key={r.id}
        >
          <div className="record-top">
            <span className="eyebrow">RT {r.rt}</span>
            <Status value={r.status} />
          </div>
          <h3>{r.title}</h3>
          <small>
            {modules[r.module]?.label} · {r.date}
          </small>
          <ArrowUpRight size={17} />
        </Link>
      ))}
    </div>
  ) : (
    <Empty />
  );
}
function Filters({
  query,
  setQuery,
  rt,
  setRt,
  status,
  setStatus,
  statuses,
}: {
  query: string;
  setQuery: (v: string) => void;
  rt: string;
  setRt: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  statuses: string[];
}) {
  return (
    <div className="filters">
      <label className="search-box">
        <Search size={17} />
        <input
          aria-label="Cari data"
          placeholder="Cari di halaman ini…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <label>
        <span className="sr-only">Filter RT</span>
        <select value={rt} onChange={(e) => setRt(e.target.value)}>
          <option value="ALL">Semua entitas</option>
          <option>RW10</option>
          {["01", "02", "03", "04"].map((n) => (
            <option value={n} key={n}>
              RT {n}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Filter status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">Semua status</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
function Dialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-heading">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          aria-label="Tutup dialog"
          onClick={close}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function RecordForm({
  module,
  user,
  busy,
  submit,
}: {
  module: string;
  user: Actor;
  busy: boolean;
  submit: (b: unknown) => void;
}) {
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        const extra: Record<string, string> = {};
        for (const key of Object.keys(moduleFields[module] || {})) {
          extra[key] = String(data["data." + key] || "");
          delete data["data." + key];
        }
        submit({ ...data, module, data: extra });
      }}
    >
      <label>
        Judul
        <input required name="title" maxLength={120} />
      </label>
      <div className="form-row">
        <label>
          Entitas
          <select
            name="rt"
            defaultValue={rwRoles.includes(user.role) ? "RW10" : user.rt}
          >
            {(rwRoles.includes(user.role)
              ? ["RW10", "01", "02", "03", "04"]
              : [user.rt]
            ).map((rt) => (
              <option key={rt}>{rt}</option>
            ))}
          </select>
        </label>
        <label>
          Tanggal / tenggat
          <input
            type="date"
            required
            name="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </label>
      </div>
      <label>
        Deskripsi
        <textarea name="description" maxLength={2000} rows={3} />
      </label>
      <div className="form-row">
        <label>
          Kategori
          {module === "finance" ? (
            <select name="category">
              <option>INCOME</option>
              <option>EXPENSE</option>
            </select>
          ) : module === "incidents" ? (
            <select name="category">
              {[
                "SECURITY",
                "ROAD",
                "LIGHTING",
                "WASTE",
                "DRAINAGE",
                "FACILITY",
                "CCTV",
                "WIFI",
                "ENVIRONMENT",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          ) : module === "emergency" ? (
            <select name="category">
              {["FLOOD", "FIRE", "SECURITY", "MISSING_PERSON", "OTHER"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
          ) : (
            <input name="category" maxLength={40} placeholder="Kategori" />
          )}
        </label>
        <label>
          Prioritas
          <select name="priority">
            <option>NORMAL</option>
            <option>LOW</option>
            <option>HIGH</option>
            <option>URGENT</option>
          </select>
        </label>
      </div>
      {module === "finance" && (
        <label>
          Nominal (Rp)
          <input
            name="amount"
            required
            type="number"
            min="0"
            max="1000000000000"
          />
        </label>
      )}
      {module === "cameras" && (
        <label>
          Akses pratinjau
          <select name="privacy">
            {[
              "PUBLIC_INFO",
              "RESIDENT",
              "SECURITY",
              "RT_ADMIN",
              "RW_ADMIN",
            ].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      )}
      {module === "students" && (
        <>
          <label>
            Sekolah
            <input name="school" required maxLength={100} />
          </label>
          <label>
            Berlaku hingga
            <input name="validUntil" type="date" />
          </label>
        </>
      )}
      {Object.entries(moduleFields[module] || {}).map(([key, label]) => (
        <label key={key}>
          {label}
          <input name={"data." + key} maxLength={250} />
        </label>
      ))}
      {manager(user) && (
        <label>
          PIC
          <input name="pic" maxLength={100} />
        </label>
      )}
      <p className="muted">
        Gunakan data fiktif. Lampiran dokumen belum didukung; jangan unggah data
        pribadi nyata.
      </p>
      <button className="button" disabled={busy}>
        {busy ? "Menyimpan…" : "Simpan contoh"} <CheckCircle2 size={16} />
      </button>
    </form>
  );
}
function Auth({
  register,
  api,
  busy,
}: {
  register: boolean;
  api: (
    p: string,
    b: unknown,
  ) => Promise<{ user?: Actor; message?: string } | null>;
  busy: boolean;
}) {
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [email, setEmail] = useState("");
  const photo = useRef("");
  return (
    <section className="auth-layout wrap section">
      <div>
        <p className="eyebrow">RUANG DIGITAL WARGA</p>
        <h1>
          {register ? "Mulai dari saling mengenal." : "Selamat datang kembali."}
        </h1>
        <p>Pelayanan yang dekat, lingkungan yang terhubung.</p>
        <div className="auth-note">
          <ShieldCheck />
          <h3>Pengujian lokal yang aman</h3>
          <p>
            Gunakan akun contoh atau daftar dengan identitas fiktif. Akun baru
            menunggu verifikasi admin RT.
          </p>
          <small>
            Password semua akun contoh: <code>Guyub10-Lokal!</code>
          </small>
        </div>
        {!register && (
          <label className="demo-select">
            Pilih akun pengujian
            <select value={email} onChange={(e) => setEmail(e.target.value)}>
              <option value="">Pilih peran…</option>
              {[
                "super",
                "rw",
                "pengurus",
                "rt01",
                "rt02",
                "rt03",
                "rt04",
                "admin01",
                "warga01",
                "warga02",
                "pelajar",
                "security",
                "operator",
                "pokja",
              ].map((id) => (
                <option key={id} value={id + "@guyub.test"}>
                  {id}@guyub.test
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <form
        className="panel form auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setSuccess("");
          const body = {
            ...Object.fromEntries(new FormData(e.currentTarget)),
            photo: photo.current,
          };
          const result = await api(register ? "register" : "login", body);
          if (result) {
            if (register) setSuccess(result.message || "Pendaftaran diterima");
            else
              router.push(manager(result.user || null) ? "/command" : "/my-rt");
          }
        }}
      >
        <h2>{register ? "Daftar warga" : "Masuk ke Guyub10"}</h2>
        {success && (
          <p role="status" className="notice">
            {success}
          </p>
        )}
        {register && (
          <>
            <label>
              Nama lengkap
              <input name="name" required maxLength={100} />
            </label>
            <label>
              Foto profil sintetis (PNG/JPEG, maks. 500 KB)
              <input
                type="file"
                required
                accept="image/png,image/jpeg"
                onChange={(e) => {
                  setPhotoError("");
                  photo.current = "";
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (
                    file.size > 500000 ||
                    !["image/png", "image/jpeg"].includes(file.type)
                  ) {
                    setPhotoError("Gunakan PNG/JPEG maksimal 500 KB");
                    e.target.value = "";
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    photo.current = String(reader.result);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {photoError && <p role="alert">{photoError}</p>}
            <label>
              Ponsel
              <input name="phone" required minLength={8} maxLength={20} />
            </label>
            <label>
              Alamat sintetis
              <textarea name="address" required maxLength={250} />
            </label>
            <div className="form-row">
              <label>
                RT
                <select name="rt">
                  {["01", "02", "03", "04"].map((rt) => (
                    <option key={rt}>{rt}</option>
                  ))}
                </select>
              </label>
              <label>
                Jenis warga
                <select name="residentType">
                  <option>TETAP</option>
                  <option>KONTRAK</option>
                  <option>SEMENTARA</option>
                </select>
              </label>
            </div>
          </>
        )}
        <label>
          Email
          <input
            name="email"
            required
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={120}
          />
        </label>
        <label>
          Kata sandi
          <input
            name="password"
            required
            type="password"
            minLength={register ? 12 : 1}
            maxLength={128}
            autoComplete={register ? "new-password" : "current-password"}
          />
        </label>
        <button className="button" disabled={busy}>
          {busy ? "Memproses…" : register ? "Ajukan pendaftaran" : "Masuk"}
          <ArrowRight size={16} />
        </button>
        <p>
          {register ? "Sudah memiliki akun?" : "Belum memiliki akun?"}{" "}
          <Link className="text-link" href={register ? "/login" : "/daftar"}>
            {register ? "Masuk" : "Daftar warga"}
          </Link>
        </p>
      </form>
    </section>
  );
}
function MapPanel({ records }: { records: Item[] }) {
  const [layer, setLayer] = useState("cameras");
  const [selected, setSelected] = useState<Item | null>(null);
  const layers = [
    ["cameras", "CCTV"],
    ["wifi", "WiFi"],
    ["facilities", "Fasilitas"],
    ["assets", "Aset / penerangan"],
    ["projects", "Drainase / proyek"],
  ] as const;
  const shown = records.filter((r) => r.module === layer).slice(0, 12);
  return (
    <>
      <div className="filters" role="group" aria-label="Layer peta">
        {layers.map(([key, label]) => (
          <button
            key={key}
            className={"mini-button " + (layer === key ? "selected" : "")}
            onClick={() => {
              setLayer(key);
              setSelected(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mock-map">
        <div className="map-road road-one" />
        <div className="map-road road-two" />
        <div className="map-road road-three" />
        {["01", "02", "03", "04"].map((n, i) => (
          <span key={n} className={"map-area area-" + i}>
            RT {n}
          </span>
        ))}
        {shown.map((r, i) => (
          <button
            key={r.id}
            className="map-pin"
            style={{
              left: `${12 + ((i * 23) % 76)}%`,
              top: `${17 + ((i * 19) % 65)}%`,
            }}
            onClick={() => setSelected(r)}
            aria-label={r.title}
          >
            <MapPin size={20} />
          </button>
        ))}
        <span className="map-watermark">
          PETA SKEMATIS · KOORDINAT FIKTIF · BUKAN NAVIGASI
        </span>
      </div>
      {selected && (
        <div className="panel">
          <h3>{selected.title}</h3>
          <Status value={selected.status} />
          <p>
            Lokasi simulasi RT {selected.rt}. Tidak ada koordinat atau perangkat
            nyata.
          </p>
        </div>
      )}
      <p className="muted">
        Pilih titik untuk melihat status. Seluruh peta dibuat lokal tanpa API
        berbayar.
      </p>
    </>
  );
}
