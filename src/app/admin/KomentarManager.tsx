"use client";

import { useState } from "react";
import { MessageSquare, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { moderasiKomentar } from "../informasi/actions";

type KomentarRow = { id: string; nama: string; email?: string; isi: string; status: string; created_at: string; pengumuman?: { judul?: string } | { judul?: string }[] };

export function KomentarManager({ komentarList }: { komentarList: KomentarRow[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "disetujui" | "ditolak" | "all">("pending");

  const filtered = komentarList.filter(
    (k) => filter === "all" || k.status === filter
  );

  const countPending = komentarList.filter((k) => k.status === "pending").length;
  const countApproved = komentarList.filter((k) => k.status === "disetujui").length;
  const countRejected = komentarList.filter((k) => k.status === "ditolak").length;

  const handleModerasi = async (id: string, status: "disetujui" | "ditolak") => {
    setLoadingId(id);
    await moderasiKomentar(id, status);
    setLoadingId(null);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const announcementOf = (row: KomentarRow) => Array.isArray(row.pengumuman) ? row.pengumuman[0] : row.pengumuman;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-violet-100 p-3 rounded-xl text-violet-600">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-zinc-800">Moderasi Komentar</h3>
          <p className="text-sm text-zinc-500 font-medium">
            {countPending} menunggu · {countApproved} disetujui · {countRejected} ditolak
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "pending", label: "Menunggu", count: countPending, color: "bg-amber-100 text-amber-700 border-amber-300" },
          { key: "disetujui", label: "Disetujui", count: countApproved, color: "bg-green-100 text-green-700 border-green-300" },
          { key: "ditolak", label: "Ditolak", count: countRejected, color: "bg-red-100 text-red-700 border-red-300" },
          { key: "all", label: "Semua", count: komentarList.length, color: "bg-zinc-100 text-zinc-700 border-zinc-300" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              filter === tab.key
                ? tab.color + " shadow-sm"
                : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 bg-white/60 rounded-full px-1.5 py-0.5">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Tidak ada komentar di kategori ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((k) => (
            <div
              key={k.id}
              className={`border rounded-2xl p-5 transition-all ${
                k.status === "pending"
                  ? "border-amber-200 bg-amber-50/30"
                  : k.status === "disetujui"
                  ? "border-green-200 bg-green-50/20"
                  : "border-red-200 bg-red-50/20"
              }`}
            >
              {/* Top row */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-black uppercase">
                    {k.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-zinc-800 text-sm">{k.nama}</p>
                    <p className="text-xs text-zinc-500">
                      {k.email || "—"} · {formatDate(k.created_at)}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                    k.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : k.status === "disetujui"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {k.status === "pending" ? <Clock className="w-3 h-3" /> : 
                   k.status === "disetujui" ? <CheckCircle className="w-3 h-3" /> : 
                   <XCircle className="w-3 h-3" />}
                  {k.status === "pending" ? "Menunggu" : k.status === "disetujui" ? "Disetujui" : "Ditolak"}
                </span>
              </div>

              {/* Artikel yang dikomentari */}
              {announcementOf(k)?.judul && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium mb-3 bg-white/70 px-3 py-1.5 rounded-lg border border-zinc-200 w-fit">
                  <ExternalLink className="w-3 h-3" />
                  Pada: <span className="text-zinc-700 font-bold truncate max-w-[200px]">{announcementOf(k)?.judul}</span>
                </div>
              )}

              {/* Isi komentar */}
              <p className="text-sm text-zinc-700 font-medium leading-relaxed bg-white/80 rounded-xl px-4 py-3 border border-zinc-100 mb-4">
                {k.isi}
              </p>

              {/* Action Buttons — hanya tampil jika pending */}
              {k.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    disabled={loadingId === k.id}
                    onClick={() => handleModerasi(k.id, "disetujui")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white font-bold rounded-xl text-xs hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Setujui
                  </button>
                  <button
                    disabled={loadingId === k.id}
                    onClick={() => handleModerasi(k.id, "ditolak")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white font-bold rounded-xl text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
