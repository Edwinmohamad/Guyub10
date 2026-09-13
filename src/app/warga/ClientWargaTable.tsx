"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type WargaRow = { id: string; nama_lengkap: string; rt: string; jenis_kelamin: string };

export default function ClientWargaTable({ wargaList }: { wargaList: WargaRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRt, setFilterRt] = useState("all");

  const filteredWarga = wargaList.filter(w => {
    const matchesSearch = w.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRt = filterRt === "all" || w.rt === filterRt;
    return matchesSearch && matchesRt;
  });

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Cari nama warga..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-muted focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium text-foreground"
          />
        </div>
        <select 
          value={filterRt}
          onChange={(e) => setFilterRt(e.target.value)}
          className="px-4 py-3 rounded-xl border border-border bg-muted focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-bold text-foreground"
        >
          <option value="all">Semua RT</option>
          <option value="001">RT 01</option>
          <option value="002">RT 02</option>
          <option value="003">RT 03</option>
          <option value="004">RT 04</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-wider rounded-lg">
            <tr>
              <th className="px-6 py-4 rounded-l-lg">No</th>
              <th className="px-6 py-4">Nama Warga</th>
              <th className="px-6 py-4">L/P</th>
              <th className="px-6 py-4 rounded-r-lg">RT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredWarga.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground font-medium">Data warga tidak ditemukan.</td>
              </tr>
            ) : (
              filteredWarga.map((w, index) => (
                <tr key={w.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground font-bold">{index + 1}</td>
                  <td className="px-6 py-4 font-black text-foreground">{w.nama_lengkap}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block w-6 h-6 text-center leading-6 rounded-full text-xs font-bold ${w.jenis_kelamin === 'L' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
                      {w.jenis_kelamin}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-muted border border-border text-foreground px-2 py-1 rounded text-xs font-bold uppercase">
                      RT {w.rt}
                    </span>
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
