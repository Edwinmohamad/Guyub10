import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 0;

export default async function SertifikatUmkmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = createAdminClient();
  
  const { data: umkm } = await supabase
    .from("umkm")
    .select(`*, profiles (nama_lengkap, rt)`)
    .eq("id", id)
    .single();

  const { data: profilRw } = await supabase
    .from("profil_rw")
    .select("ketua_nama")
    .limit(1)
    .single();

  if (!umkm || !umkm.is_approved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">UMKM tidak ditemukan atau belum disetujui.</h1>
      </div>
    );
  }

  const tanggalDisetujui = new Date(umkm.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="min-h-screen bg-zinc-200 py-10 print:py-0 print:bg-white flex justify-center items-center font-sans">
      <div className="w-[800px] h-[565px] bg-white relative overflow-hidden shadow-2xl print:shadow-none print:w-full print:h-full flex flex-col items-center justify-center border-[16px] border-double border-primary/20">
        
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-br-full -z-10"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-tl-full -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-primary/5 rounded-full -z-10"></div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-primary tracking-wider uppercase" style={{ fontFamily: "var(--font-bitter)" }}>
            Sertifikat Kemitraan UMKM
          </h1>
          <p className="text-lg font-bold text-accent tracking-widest uppercase mt-2">
            Pemerintah RW 10 Desa Cicadas
          </p>
        </div>

        {/* Content */}
        <div className="text-center max-w-xl mx-auto space-y-6 z-10">
          <p className="text-zinc-600 font-medium italic text-lg">Diberikan kepada:</p>
          
          <div>
            <h2 className="text-4xl font-black text-zinc-900 border-b-2 border-primary/30 inline-block pb-2 px-8 mb-2">
              {umkm.nama_usaha}
            </h2>
            <p className="text-zinc-700 font-bold text-lg">
              Pemilik: {umkm.profiles?.nama_lengkap} (RT {umkm.profiles?.rt})
            </p>
          </div>

          <p className="text-zinc-600 font-medium leading-relaxed">
            Telah resmi terdaftar sebagai Mitra UMKM RW 10 dalam kategori <strong className="text-primary">{umkm.kategori}</strong>.
            Semoga usaha yang dijalankan semakin berkembang, membawa keberkahan, dan memajukan perekonomian warga lingkungan RW 10.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-16 flex justify-between w-full max-w-2xl px-12 z-10">
          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-16">Tanggal Diterbitkan</p>
            <p className="font-bold text-zinc-900 border-t border-zinc-400 pt-2 px-4">{tanggalDisetujui}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-500 mb-16">Mengetahui, Ketua RW 10</p>
            <p className="font-bold text-zinc-900 border-t border-zinc-400 pt-2 px-4">{profilRw?.ketua_nama || "Ketua RW"}</p>
          </div>
        </div>

      </div>

      {/* Script to trigger print on load */}
      <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { window.print(); }' }} />
    </div>
  );
}
