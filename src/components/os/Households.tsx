"use client";
import { useEffect, useState } from "react";
import type { Household, FamilyMember } from "@/lib/local/households";
import { rwRoles, type Actor } from "@/lib/local/model";
const statuses = ["ACTIVE", "MOVED", "TEMPORARY", "DECEASED", "UNVERIFIED"];
export function Households({ user }: { user: Actor }) {
  const [homes, setHomes] = useState<Household[]>([]),
    [selected, setSelected] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false),
    [creating, setCreating] = useState(false),
    [editor, setEditor] = useState<FamilyMember | "new" | null>(null),
    [moving, setMoving] = useState<FamilyMember | null>(null),
    [query, setQuery] = useState("");
  useEffect(() => {
    let cancelled = false;
    fetch("/api/local/households", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw Error(data.error);
        if (!cancelled) {
          setHomes(data.households);
          setLoaded(true);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const home = homes.find((h) => h.id === selected);
  async function submit(body: unknown, create = false) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/local/households", {
        method: create ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      const response = await fetch("/api/local/households", {
        cache: "no-store",
      });
      const all = await response.json();
      if (!response.ok) throw Error(all.error);
      setHomes(all.households);
      setSelected(data.household.id);
      setCreating(false);
      setEditor(null);
      setMoving(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="family-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">DATA PRIVAT · SINTETIS</p>
          <h2>Rumah tangga & keluarga</h2>
        </div>
        <button
          disabled={busy}
          className="button"
          onClick={() => {
            setCreating(!creating);
            setEditor(null);
            setMoving(null);
          }}
        >
          Tambah rumah tangga
        </button>
      </div>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {!loaded && <p role="status">Memuat keluarga…</p>}
      {creating && (
        <form
          className="panel form"
          onSubmit={(e) => {
            e.preventDefault();
            submit(
              {
                action: "create",
                ...Object.fromEntries(new FormData(e.currentTarget)),
              },
              true,
            );
          }}
        >
          <h3>Rumah tangga baru</h3>
          <label>
            RT keluarga
            <select name="rt">
              {(rwRoles.includes(user.role)
                ? ["01", "02", "03", "04"]
                : [user.rt]
              ).map((rt) => (
                <option key={rt}>{rt}</option>
              ))}
            </select>
          </label>
          <label>
            KK sintetis
            <input name="kk" pattern="0[0-9]{15}" maxLength={16} />
          </label>
          <label>
            Alamat keluarga sintetis
            <input name="address" required maxLength={250} />
          </label>
          <button className="button" disabled={busy}>
            Simpan rumah tangga
          </button>
        </form>
      )}
      <label className="search-box">
        <input
          aria-label="Cari rumah tangga"
          placeholder="Cari alamat atau anggota keluarga…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="family-layout">
        <div className="family-list">
          {homes
            .filter((h) =>
              `${h.address} ${h.members.map((m) => m.name).join(" ")}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((h) => (
              <button
                disabled={busy}
                key={h.id}
                aria-pressed={h.id === selected}
                className={
                  "panel family-choice " + (h.id === selected ? "selected" : "")
                }
                onClick={() => {
                  setSelected(h.id);
                  setEditor(null);
                  setMoving(null);
                  setError("");
                }}
              >
                <strong>{h.address}</strong>
                <small>
                  RT {h.rt} · {h.members.length} anggota
                </small>
                <span>
                  Kepala:{" "}
                  {h.members.find((m) => m.id === h.headId)?.name ||
                    "Belum ada anggota"}
                </span>
              </button>
            ))}
        </div>
        <div className="family-detail">
          {home ? (
            <>
              <form
                key={home.id + home.headId + home.address}
                className="panel form"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit({
                    action: "profile",
                    id: home.id,
                    ...Object.fromEntries(new FormData(e.currentTarget)),
                  });
                }}
              >
                <h3>Profil rumah tangga · RT {home.rt}</h3>
                <label>
                  Alamat keluarga
                  <input
                    name="address"
                    required
                    defaultValue={home.address}
                    maxLength={250}
                  />
                </label>
                <label>
                  KK keluarga sintetis
                  <input
                    name="kk"
                    defaultValue={home.kk}
                    pattern="0[0-9]{15}"
                    maxLength={16}
                  />
                </label>
                <label>
                  Kepala keluarga
                  <select name="headId" defaultValue={home.headId}>
                    <option value="">Belum ada anggota</option>
                    {home.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="button" disabled={busy}>
                  Simpan profil keluarga
                </button>
              </form>
              <div className="section-title">
                <h3>Anggota keluarga</h3>
                <button
                  disabled={busy}
                  className="mini-button"
                  onClick={() => {
                    setEditor("new");
                    setMoving(null);
                  }}
                >
                  Tambah anggota
                </button>
              </div>
              <div className="table-scroll">
                <table>
                  <caption>Anggota rumah tangga sintetis</caption>
                  <thead>
                    <tr>
                      <th>Nama / hubungan</th>
                      <th>Status</th>
                      <th>Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {home.members.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.name}</strong>
                          <small>
                            {m.relation}
                            {m.id === home.headId ? " · Kepala keluarga" : ""}
                            <br />
                            {m.gender} ·{" "}
                            {m.birthDate || "Tanggal lahir belum diisi"}
                            <br />
                            NIK: {m.nik || "Belum diisi"}
                          </small>
                        </td>
                        <td>
                          {m.residentStatus}
                          <small>
                            {[
                              m.student ? "Pelajar" : "",
                              m.elderly ? "Lansia" : "",
                              m.child ? "Anak" : "",
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </small>
                        </td>
                        <td>
                          <button
                            disabled={busy}
                            className="mini-button"
                            onClick={() => {
                              setEditor(m);
                              setMoving(null);
                            }}
                          >
                            Edit {m.name}
                          </button>
                          <button
                            disabled={busy}
                            className="mini-button"
                            onClick={() => {
                              setMoving(m);
                              setEditor(null);
                            }}
                          >
                            Pindah {m.name}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!home.members.length && (
                <p className="empty">
                  Belum ada anggota. Anggota pertama menjadi kepala keluarga.
                </p>
              )}
              {editor && (
                <form
                  key={editor === "new" ? "new" : editor.id}
                  className="panel form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget);
                    const member = {
                      ...Object.fromEntries(form),
                      student: form.has("student"),
                      elderly: form.has("elderly"),
                      child: form.has("child"),
                    };
                    submit({
                      action: "member",
                      id: home.id,
                      memberId: editor === "new" ? "" : editor.id,
                      member,
                    });
                  }}
                >
                  <h3>
                    {editor === "new"
                      ? "Tambah anggota keluarga"
                      : "Edit anggota keluarga"}
                  </h3>
                  {(
                    [
                      "name",
                      "nik",
                      "relation",
                      "birthDate",
                      "employment",
                      "maritalStatus",
                    ] as const
                  ).map((key, i) => (
                    <label key={key}>
                      {
                        [
                          "Nama anggota",
                          "NIK anggota sintetis",
                          "Hubungan keluarga",
                          "Tanggal lahir anggota",
                          "Pekerjaan anggota",
                          "Status perkawinan",
                        ][i]
                      }
                      <input
                        name={key}
                        required={key === "name"}
                        type={key === "birthDate" ? "date" : "text"}
                        maxLength={key === "nik" ? 16 : 100}
                        pattern={key === "nik" ? "0[0-9]{15}" : undefined}
                        defaultValue={editor === "new" ? "" : editor[key]}
                      />
                    </label>
                  ))}
                  <label>
                    Jenis kelamin anggota
                    <select
                      name="gender"
                      defaultValue={editor === "new" ? "" : editor.gender}
                    >
                      <option value="">Belum diisi</option>
                      <option>L</option>
                      <option>P</option>
                    </select>
                  </label>
                  <label>
                    Status anggota
                    <select
                      name="residentStatus"
                      defaultValue={
                        editor === "new" ? "UNVERIFIED" : editor.residentStatus
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  {(["student", "elderly", "child"] as const).map((key, i) => (
                    <label className="family-checkbox" key={key}>
                      <input
                        type="checkbox"
                        name={key}
                        defaultChecked={editor !== "new" && editor[key]}
                      />
                      {["Pelajar", "Lansia", "Anak"][i]}
                    </label>
                  ))}
                  <div className="button-row">
                    <button className="button" disabled={busy}>
                      Simpan anggota
                    </button>
                    <button
                      disabled={busy}
                      type="button"
                      className="mini-button"
                      onClick={() => setEditor(null)}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
              {moving && (
                <form
                  className="panel form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit({
                      action: "move",
                      id: home.id,
                      memberId: moving.id,
                      ...Object.fromEntries(new FormData(e.currentTarget)),
                    });
                  }}
                >
                  <h3>Pindahkan {moving.name}</h3>
                  <p>
                    Tujuan harus berada dalam cakupan peran Anda. Identitas
                    anggota tetap dipertahankan.
                  </p>
                  <label>
                    Rumah tangga tujuan
                    <select name="targetId" required>
                      <option value="">Pilih rumah tangga</option>
                      {homes
                        .filter((h) => h.id !== home.id)
                        .map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.address} · RT {h.rt}
                          </option>
                        ))}
                    </select>
                  </label>
                  {home.headId === moving.id && home.members.length > 1 && (
                    <label>
                      Kepala keluarga pengganti
                      <select name="replacementHeadId" required>
                        <option value="">Pilih pengganti</option>
                        {home.members
                          .filter((m) => m.id !== moving.id)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  )}
                  <button className="button" disabled={busy}>
                    Konfirmasi pemindahan
                  </button>
                  <button
                    disabled={busy}
                    type="button"
                    className="mini-button"
                    onClick={() => setMoving(null)}
                  >
                    Batal
                  </button>
                </form>
              )}
            </>
          ) : (
            <p className="empty">
              Pilih rumah tangga untuk mengelola keluarga.
            </p>
          )}
        </div>
      </div>
      <p className="muted">
        Data keluarga terpisah dari akun login. Menambahkan anggota tidak
        membuat akun, mengubah peran, atau memberi akses masuk.
      </p>
    </section>
  );
}
