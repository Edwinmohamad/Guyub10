import { createClient } from "@/lib/supabase/server";
import { MessageSquare, Clock, CheckCircle2 } from "lucide-react";

export default async function AspirasiList() {
  const supabase = await createClient();

  const { data: aspirasiList } = await supabase
    .from("aspirasi")
    .select("id, nama, kategori, pesan, status, balasan_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (!aspirasiList || aspirasiList.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground font-medium">Belum ada aspirasi publik.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {aspirasiList.map(a => (
        <div key={a.id} className="bg-card p-4 rounded-2xl border border-border shadow-sm relative overflow-hidden">
          {a.status === 'selesai' && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full flex items-start justify-end p-2"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>}
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded uppercase tracking-wider">{a.kategori}</span>
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(a.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}</span>
          </div>
          
          <p className="font-bold text-foreground text-sm mb-1">{a.nama}</p>
          <p className="text-muted-foreground text-sm mb-3">&ldquo;{a.pesan}&rdquo;</p>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
              a.status === 'selesai' ? 'bg-green-100 text-green-700 border-green-200' :
              a.status === 'diproses' ? 'bg-primary/10 text-primary border-primary/20' :
              'bg-highlight/20 text-highlight border-highlight/30'
            }`}>
              {a.status}
            </span>
          </div>

          {a.balasan_admin && (
            <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/20 ml-4">
              <p className="text-[10px] font-black text-primary uppercase mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3"/> Tanggapan Pengurus:</p>
              <p className="text-xs text-foreground font-medium">{a.balasan_admin}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
