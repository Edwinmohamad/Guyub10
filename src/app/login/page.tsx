"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { login } from "./actions";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await login(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return <div data-private-shell className="min-h-screen bg-[#f3f6f3] px-5 py-8"><div className="mx-auto max-w-md"><Link href="/" className="inline-flex min-h-11 items-center gap-2 py-2 text-sm font-bold text-emerald-950"><ArrowLeft aria-hidden="true" className="size-4" />Kembali ke beranda</Link><main className="mt-8 rounded-xl border border-border bg-white p-6 md:p-8"><div className="flex items-center gap-3"><Image src="/logo-rw.jpg" alt="Logo RW 10" width={52} height={52} className="size-13 rounded-full object-cover" /><div><p className="text-sm font-bold text-emerald-800">Guyub 10</p><p className="text-xs text-muted-foreground">Portal RW 10 Desa Cicadas</p></div></div><LockKeyhole aria-hidden="true" className="mt-8 size-6 text-emerald-800" /><h1 className="mt-3 text-3xl font-extrabold">Masuk sebagai pengurus</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Halaman ini hanya untuk akun pengurus yang telah diberi akses.</p>{error ? <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p> : null}<form action={handleSubmit} className="mt-6 space-y-5"><label className="block"><span className="mb-2 block text-sm font-bold">Email pengurus</span><input name="email" type="email" autoComplete="email" required className="min-h-12 w-full rounded-lg border border-input px-3 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20" /></label><label className="block"><span className="mb-2 block text-sm font-bold">Kata sandi</span><span className="relative block"><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required className="min-h-12 w-full rounded-lg border border-input px-3 pr-12 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground"><span className="sr-only">{showPassword ? "Sembunyikan" : "Tampilkan"}</span>{showPassword ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}</button></span></label><button disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-emerald-900 px-4 text-sm font-bold text-white disabled:opacity-60">{loading ? <><Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />Memverifikasi</> : "Masuk ke admin"}</button></form></main></div></div>;
}
