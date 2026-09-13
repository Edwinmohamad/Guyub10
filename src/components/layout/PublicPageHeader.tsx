import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type PublicPageHeaderProps = {
  title: string;
  description: string;
  label: string;
  icon: LucideIcon;
  action?: { href: string; label: string };
};

export default function PublicPageHeader({ title, description, label, icon: Icon, action }: PublicPageHeaderProps) {
  return (
    <header className="border-b border-emerald-100 bg-emerald-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[1fr_auto] md:items-end md:px-8 md:py-16 lg:px-10">
        <div className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-emerald-200">
            <Link href="/" className="rounded-sm hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Beranda</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-white">{label}</span>
          </nav>
          <div className="flex items-start gap-4">
            <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-100/85 md:text-lg">{description}</p>
            </div>
          </div>
        </div>
        {action ? (
          <Link href={action.href} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-50">
            {action.label}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
