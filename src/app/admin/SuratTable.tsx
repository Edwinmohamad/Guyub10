"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, Clock, Loader2, Printer } from "lucide-react";
import { updateSuratStatus } from "./actions";

interface Surat {
  id: string;
  jenis_surat: string;
  keperluan: string;
  status: string;
  lampiran_url?: string;
  created_at: string;
  profiles: { nama_lengkap: string; rt: string }[] | { nama_lengkap: string; rt: string } | null;
}

type SuratProfile = { nama_lengkap: string; rt: string };

function getProfile(profiles: Surat["profiles"]): SuratProfile | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0] ?? null;
  return profiles;
}

export function SuratTable({ suratList, ketuaNama = "Ketua RW" }: { suratList: Surat[], ketuaNama?: string }) {
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  const handleUpdate = (id: string, status: "diproses" | "selesai" | "ditolak") => {
    setActionId(id);
    startTransition(async () => {
      await updateSuratStatus(id, status);
      setActionId(null);
    });
  };

  const handleGeneratePdf = async (surat: Surat) => {
    try {
      const { PDFDocument, StandardFonts } = await import("pdf-lib");
      const profile = getProfile(surat.profiles);
      const doc = await PDFDocument.create();
      const page = doc.addPage([595.28, 841.89]); // A4 Size
      const timesRomanFont = await doc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBold = await doc.embedFont(StandardFonts.TimesRomanBold);

      const { width, height } = page.getSize();
      const fontSize = 12;

      // Header
      page.drawText('PEMERINTAH KABUPATEN BOGOR', { x: 190, y: height - 50, size: 14, font: timesRomanBold });
      page.drawText('KECAMATAN GUNUNG PUTRI', { x: 210, y: height - 70, size: 14, font: timesRomanBold });
      page.drawText('DESA CICADAS', { x: 250, y: height - 90, size: 14, font: timesRomanBold });
      page.drawText('RUKUN WARGA (RW) 10', { x: 230, y: height - 110, size: 14, font: timesRomanBold });
      page.drawLine({ start: { x: 50, y: height - 130 }, end: { x: width - 50, y: height - 130 }, thickness: 2 });

      // Title
      page.drawText(surat.jenis_surat.toUpperCase(), { x: 150, y: height - 160, size: 14, font: timesRomanBold });
      page.drawText(`Nomor: 145 / ${surat.id.substring(0,4).toUpperCase()} / RW.10 / ${new Date().getFullYear()}`, { x: 200, y: height - 180, size: 12, font: timesRomanFont });

      // Body
      const bodyText = [
        `Yang bertanda tangan di bawah ini, Ketua RW 10 Desa Cicadas, menerangkan bahwa:`,
        ` `,
        `Nama Lengkap        : ${profile?.nama_lengkap ?? "Tidak diketahui"}`,
        `RT/RW                     : RT ${profile?.rt ?? "-"} / RW 10`,
        `Keperluan Surat      : ${surat.keperluan}`,
        `Tanggal Pengajuan : ${new Date(surat.created_at).toLocaleDateString('id-ID')}`,
        ` `,
        `Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`
      ];

      let currentY = height - 230;
      for (const line of bodyText) {
        page.drawText(line, { x: 60, y: currentY, size: fontSize, font: timesRomanFont });
        currentY -= 20;
      }

      // Footer
      page.drawText(`Gunung Putri, ${new Date().toLocaleDateString('id-ID')}`, { x: 400, y: currentY - 40, size: fontSize, font: timesRomanFont });
      page.drawText('Ketua RW 10', { x: 420, y: currentY - 60, size: fontSize, font: timesRomanFont });
      page.drawText(`( ${ketuaNama} )`, { x: 410, y: currentY - 130, size: fontSize, font: timesRomanBold });

      const pdfBytes = await doc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Surat_${surat.jenis_surat}_${profile?.nama_lengkap}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal mencetak PDF.");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      pending: { cls: "bg-amber-100 text-amber-700 border-amber-200", label: "Menunggu" },
      diproses: { cls: "bg-blue-100 text-blue-700 border-blue-200", label: "Diproses" },
      selesai: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Selesai" },
      ditolak: { cls: "bg-red-100 text-red-700 border-red-200", label: "Ditolak" },
    };
    const s = map[status] ?? map["pending"];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${s.cls}`}>
        {status === "pending" && <Clock className="w-3 h-3" />}
        {status === "selesai" && <CheckCircle className="w-3 h-3" />}
        {status === "ditolak" && <XCircle className="w-3 h-3" />}
        {s.label}
      </span>
    );
  };

  if (suratList.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 font-medium">
        <Clock className="w-14 h-14 mx-auto mb-4 opacity-30" />
        <p>Belum ada pengajuan surat dari warga.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <th className="text-left py-3 px-4 font-bold text-zinc-600">Nama Warga</th>
            <th className="text-left py-3 px-4 font-bold text-zinc-600">RT</th>
            <th className="text-left py-3 px-4 font-bold text-zinc-600">Jenis Surat</th>
            <th className="text-left py-3 px-4 font-bold text-zinc-600">Keperluan</th>
            <th className="text-left py-3 px-4 font-bold text-zinc-600">Status</th>
            <th className="text-left py-3 px-4 font-bold text-zinc-600">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {suratList.map((surat) => {
              const profile = getProfile(surat.profiles);
              return (
            <tr key={surat.id} className="hover:bg-zinc-50 transition-colors">
              <td className="py-3 px-4 font-semibold text-zinc-800">{profile?.nama_lengkap ?? "—"}</td>
              <td className="py-3 px-4 text-zinc-600">RT {profile?.rt ?? "—"}</td>
              <td className="py-3 px-4 text-zinc-700">{surat.jenis_surat}</td>
              <td className="py-3 px-4 text-zinc-600 max-w-[200px] truncate">{surat.keperluan}</td>
              <td className="py-3 px-4">{statusBadge(surat.status)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 mb-2">
                  {surat.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleUpdate(surat.id, "diproses")}
                        disabled={isPending && actionId === surat.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                      >
                        {isPending && actionId === surat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Proses
                      </button>
                      <button
                        onClick={() => handleUpdate(surat.id, "selesai")}
                        disabled={isPending && actionId === surat.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                      >
                        Selesai
                      </button>
                      <button
                        onClick={() => handleUpdate(surat.id, "ditolak")}
                        disabled={isPending && actionId === surat.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                  {surat.status === "diproses" && (
                    <button
                      onClick={() => handleUpdate(surat.id, "selesai")}
                      disabled={isPending && actionId === surat.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60"
                    >
                      Tandai Selesai
                    </button>
                  )}
                  {(surat.status === "selesai" || surat.status === "ditolak") && (
                    <span className="text-xs text-zinc-400 font-medium mr-2">Selesai/Ditolak</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {surat.lampiran_url && (
                    <button
                      onClick={() => setViewUrl(surat.lampiran_url || null)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Lampiran
                    </button>
                  )}
                  {surat.status === "selesai" && (
                    <button
                      onClick={() => handleGeneratePdf(surat)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      <Printer className="w-3 h-3" /> Cetak PDF
                    </button>
                  )}
                </div>
              </td>
            </tr>
              );
          })}
        </tbody>
      </table>

      {viewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Dokumen Lampiran</h3>
              <button 
                onClick={() => setViewUrl(null)}
                className="p-2 hover:bg-zinc-100 rounded-full"
              >
                <XCircle className="w-6 h-6 text-zinc-500" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex justify-center bg-zinc-50">
              {viewUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={viewUrl} className="w-full h-[70vh] rounded-xl border-2 border-zinc-200" title="PDF Document" />
              ) : (
                <Image src={viewUrl} alt="Lampiran" width={1200} height={800} className="max-w-full max-h-[70vh] object-contain rounded-xl border-2 border-zinc-200" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
