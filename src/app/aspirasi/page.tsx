import { MessageSquareText } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import AspirasiList from "./AspirasiList";
import AspirasiForm from "./AspirasiForm";

export default function AspirasiPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader icon={MessageSquareText} label="Aspirasi" title="Sampaikan aspirasi" description="Kirim saran, masukan, atau keluhan untuk membantu pengurus memperbaiki lingkungan RW 10." />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:px-10">
        <div className="rounded-xl border border-border bg-white p-5 md:p-7"><AspirasiForm /></div>
        <aside className="rounded-xl border border-border bg-muted/40 p-5 md:p-7"><h2 className="mb-5 text-xl font-bold">Aspirasi yang dipublikasikan</h2><AspirasiList /></aside>
      </section>
    </div>
  );
}
