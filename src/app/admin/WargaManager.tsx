"use client";

import { useState } from "react";
import { Database, Plus, Trash2, Download, Search, FileUp } from "lucide-react";
import { createWarga, deleteWarga, bulkInsertWarga } from "./actions";

type WargaRow = { id: string; nik: string; no_kk?: string; nama_lengkap: string; tempat_lahir?: string; tanggal_lahir?: string; jenis_kelamin?: string; agama?: string; status_perkawinan?: string; pekerjaan?: string; pendidikan?: string; rt: string; alamat?: string; status_warga?: string };
type WargaImportRow = Record<string, unknown> & { nik: string; no_kk: string; nama_lengkap: string; tempat_lahir: string; jenis_kelamin: string; agama: string; rt: string; alamat: string; tanggal_lahir: string | null; status_perkawinan: string; pekerjaan: string; pendidikan: string };

export function WargaManager({ wargaList }: { wargaList: WargaRow[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRt, setFilterRt] = useState("all");
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<WargaImportRow[] | null>(null);

  const filteredWarga = wargaList.filter(w => {
    const matchesSearch = w.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) || w.nik.includes(searchTerm);
    const matchesRt = filterRt === "all" || w.rt === filterRt;
    return matchesSearch && matchesRt;
  });

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await createWarga(formData);
    setIsAdding(false);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Yakin ingin menghapus data warga ini?")) {
      await deleteWarga(id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import("xlsx");
        const bstr = evt.target?.result;
        // raw: true preserves numbers as-is, cellText: true to get text representation
        const wb = XLSX.read(bstr, { type: 'binary', cellText: true, cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // defval: "" so empty cells become empty strings, raw: false so numbers come as text
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { raw: false, defval: "" });

        // Helper: convert any number-like value to a clean integer string
        const toIdStr = (val: unknown): string => {
          if (!val && val !== 0) return "";
          const s = String(val).trim();
          // Handle scientific notation e.g. "3.2010245e+15"
          if (s.toLowerCase().includes('e')) {
            try {
              return BigInt(Math.round(Number(s))).toString();
            } catch {
              return s.replace(/[^0-9]/g, '');
            }
          }
          // Remove decimals if any (e.g. "3201024000.0" → "3201024000")
          return s.split('.')[0].replace(/[^0-9]/g, '');
        };

        // Helper: convert dates like "23-11-2002" or JS Dates into "YYYY-MM-DD"
        const parseDate = (val: unknown): string | null => {
          if (!val) return null;
          if (val instanceof Date) {
            if (isNaN(val.getTime())) return null;
            return val.toISOString().split('T')[0];
          }
          const s = String(val).trim();
          
          // Handle Excel serial date (e.g. "34575")
          if (/^\d+$/.test(s) && s.length >= 4 && s.length <= 5) {
            const serial = parseInt(s, 10);
            if (serial > 10000 && serial < 80000) { // roughly 1927 to 2119
              // Excel offset to JS epoch (Jan 1 1970) is 25569 days
              const jsDate = new Date((serial - 25569) * 86400 * 1000);
              return jsDate.toISOString().split('T')[0];
            }
          }
          
          // Match standard YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
          
          // Match DD-MM-YYYY or DD/MM/YYYY
          const parts = s.split(/[-/]/);
          if (parts.length === 3) {
            let day = parts[0];
            let month = parts[1];
            let year = parts[2];
            
            // If year is first (YYYY-MM-DD)
            if (parts[0].length === 4) {
              year = parts[0];
              month = parts[1];
              day = parts[2];
            } else if (parts[2].length === 2) {
              // 2-digit year (assume 19xx or 20xx based on value)
              const y = parseInt(parts[2], 10);
              year = y < 50 ? `20${parts[2]}` : `19${parts[2]}`;
            }
            
            month = month.padStart(2, '0');
            day = day.padStart(2, '0');
            
            const iso = `${year}-${month}-${day}`;
            if (!isNaN(new Date(iso).getTime())) {
              return iso;
            }
          }
          return null;
        };
        
        if (data.length > 0) {
          const rows: WargaImportRow[] = data.map((d) => ({
            nik: toIdStr(d["NIK"] || d["nik"] || "").slice(0, 16),
            no_kk: toIdStr(d["No KK"] || d["no_kk"] || "").slice(0, 20),
            nama_lengkap: String(d["Nama Lengkap"] || d["nama_lengkap"] || "Tanpa Nama").trim(),
            tempat_lahir: String(d["Tempat Lahir"] || d["tempat_lahir"] || "").trim(),
            jenis_kelamin: String(d["L/P"] || d["jenis_kelamin"] || "L").trim().toUpperCase().slice(0, 1),
            agama: String(d["Agama"] || d["agama"] || "Islam").trim(),
            rt: String(d["RT"] || d["rt"] || "001").trim().padStart(3, '0'),
            alamat: String(d["Alamat"] || d["alamat"] || "").trim(),
            tanggal_lahir: parseDate(d["Tanggal Lahir"] || d["tanggal_lahir"]),
            status_perkawinan: String(d["Status"] || d["status_perkawinan"] || "").trim(),
            pekerjaan: String(d["Pekerjaan"] || d["pekerjaan"] || "").trim(),
            pendidikan: String(d["Pendidikan"] || d["pendidikan"] || "").trim(),
          }));
          
          // Validate - filter out rows with invalid NIK
          const validRows = rows.filter(r => r.nik.length >= 10 && r.nama_lengkap);
          
          // Deduplicate by NIK (keep the last occurrence)
          const uniqueRowsMap = new Map<string, WargaImportRow>();
          for (const row of validRows) {
            uniqueRowsMap.set(row.nik, row);
          }
          const uniqueRows = Array.from(uniqueRowsMap.values());
          
          const skipped = rows.length - validRows.length;
          const duplicates = validRows.length - uniqueRows.length;

          if (uniqueRows.length === 0) {
            alert("Tidak ada data valid ditemukan. Pastikan kolom NIK dan Nama Lengkap terisi.");
            return;
          }

          if (skipped > 0 || duplicates > 0) {
            let msg = `Peringatan:\n`;
            if (skipped > 0) msg += `- ${skipped} baris dilewati karena NIK tidak valid.\n`;
            if (duplicates > 0) msg += `- ${duplicates} baris duplikat NIK digabungkan.\n`;
            msg += `\nTotal ${uniqueRows.length} baris siap diimport.`;
            alert(msg);
          }
          
          setPreviewData(uniqueRows);
        } else {
          alert("Data Excel kosong.");
        }
      } catch {
        alert("Gagal membaca file Excel. Pastikan formatnya benar.");
      } finally {
        setIsImporting(false);
        e.target.value = ''; // Reset input
      }
    };
    reader.readAsBinaryString(file);
  };


  const handleConfirmImport = async () => {
    if (!previewData) return;
    setIsSubmitting(true);
    const result = await bulkInsertWarga(previewData);
    if (result.success) {
      alert(`Berhasil import ${previewData.length} data warga.`);
      setPreviewData(null);
    } else {
      alert(`Gagal import: ${result.error}`);
    }
    setIsSubmitting(false);
  };

  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const headers = ["NIK", "No KK", "Nama Lengkap", "Tempat Lahir", "Tanggal Lahir", "L/P", "Agama", "Status", "Pekerjaan", "Pendidikan", "RT", "Alamat"];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      headers,
      ["3201020304050001", "3201020304050000", "Ahmad Saepudin", "Bogor", "1990-01-01", "L", "Islam", "Kawin", "Wiraswasta", "S1", "001", "Jl. Cicadas"]
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Import_Warga.xlsx");
  };

  const exportToCSV = () => {
    const headers = ["NIK", "No KK", "Nama Lengkap", "Tempat Lahir", "Tanggal Lahir", "L/P", "Agama", "Status", "Pekerjaan", "Pendidikan", "RT", "Alamat"];
    const csvContent = [
      headers.join(","),
      ...wargaList.map(w => [
        w.nik, w.no_kk, `"${w.nama_lengkap}"`, `"${w.tempat_lahir || ''}"`, w.tanggal_lahir || '', 
        w.jenis_kelamin || '', w.agama || '', w.status_perkawinan || '', `"${w.pekerjaan || ''}"`, 
        `"${w.pendidikan || ''}"`, w.rt, `"${w.alamat || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `data_warga_rw10_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-800">Database Warga</h3>
            <p className="text-sm text-zinc-500 font-medium">Total: {wargaList.length} Jiwa</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative overflow-hidden group">
            <button disabled={isImporting} className="bg-zinc-100 text-zinc-700 font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50">
              {isImporting ? <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin"></span> : <FileUp className="w-4 h-4"/>}
              Import Excel
            </button>
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <button 
            onClick={downloadTemplate}
            className="bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition-colors"
          >
            <Download className="w-4 h-4"/> Template
          </button>
          <button 
            onClick={exportToCSV}
            className="bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors"
          >
            <Download className="w-4 h-4"/> Export CSV
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-primary text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            {isAdding ? "Batal" : <><Plus className="w-4 h-4"/> Tambah Warga</>}
          </button>
        </div>
      </div>

      {previewData && (
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200 mb-6 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h4 className="font-black text-blue-900 text-lg">Preview Data Import</h4>
              <p className="text-sm text-blue-700 font-medium">Menampilkan 10 baris pertama dari {previewData.length} data yang akan diimport.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 bg-white text-zinc-600 font-bold rounded-lg border border-zinc-200 hover:bg-zinc-50"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmImport}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                Konfirmasi Import
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50 text-blue-900">
                <tr>
                  <th className="p-3 font-bold">NIK</th>
                  <th className="p-3 font-bold">No KK</th>
                  <th className="p-3 font-bold">Nama Lengkap</th>
                  <th className="p-3 font-bold">L/P</th>
                  <th className="p-3 font-bold">RT</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-blue-50 last:border-0 hover:bg-zinc-50">
                    <td className="p-3 font-medium text-zinc-700">{row.nik}</td>
                    <td className="p-3 text-zinc-600">{row.no_kk}</td>
                    <td className="p-3 text-zinc-900 font-bold">{row.nama_lengkap}</td>
                    <td className="p-3 text-zinc-600">{row.jenis_kelamin}</td>
                    <td className="p-3 text-zinc-600">RT {row.rt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mb-6">
          <h4 className="font-bold mb-4 border-b pb-2">Form Tambah Warga</h4>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-red-500">NIK *</label>
              <input type="text" name="nik" required maxLength={16} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">No KK</label>
              <input type="text" name="no_kk" maxLength={16} className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-red-500">Nama Lengkap *</label>
              <input type="text" name="nama_lengkap" required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-red-500">RT *</label>
              <select name="rt" required className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm">
                <option value="001">RT 01</option>
                <option value="002">RT 02</option>
                <option value="003">RT 03</option>
                <option value="004">RT 04</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Jenis Kelamin</label>
              <select name="jenis_kelamin" className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Agama</label>
              <input type="text" name="agama" defaultValue="Islam" className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Tempat Lahir</label>
              <input type="text" name="tempat_lahir" className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Tanggal Lahir</label>
              <input type="date" name="tanggal_lahir" className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold">Pekerjaan</label>
              <input type="text" name="pekerjaan" className="w-full p-2.5 rounded-lg border border-zinc-300 text-sm" />
            </div>
            <div className="md:col-span-3 mt-4 flex justify-end">
              <button disabled={isSubmitting} type="submit" className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl disabled:opacity-50">
                Simpan Data Warga
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Cari NIK atau Nama..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 p-2.5 rounded-xl border border-zinc-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary" 
          />
        </div>
        <select 
          value={filterRt}
          onChange={(e) => setFilterRt(e.target.value)}
          className="p-2.5 rounded-xl border border-zinc-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary font-bold"
        >
          <option value="all">Semua RT</option>
          <option value="001">RT 01</option>
          <option value="002">RT 02</option>
          <option value="003">RT 03</option>
          <option value="004">RT 04</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto border border-zinc-200 rounded-2xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-xs">
            <tr>
              <th className="px-4 py-3">NIK</th>
              <th className="px-4 py-3">Nama Lengkap</th>
              <th className="px-4 py-3">L/P</th>
              <th className="px-4 py-3">Umur/TTL</th>
              <th className="px-4 py-3">RT</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredWarga.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-zinc-400">Data warga tidak ditemukan.</td></tr>
            ) : (
              filteredWarga.map((w) => (
                <tr key={w.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-mono text-xs">{w.nik}</td>
                  <td className="px-4 py-3 font-bold text-zinc-800">{w.nama_lengkap}</td>
                  <td className="px-4 py-3">{w.jenis_kelamin}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{w.tempat_lahir}, {w.tanggal_lahir ? new Date(w.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">RT {w.rt}</span></td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(w.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
