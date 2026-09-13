import { Users } from "lucide-react";

type DataPoint = {
  name: string;
  value: number;
};

type InfografisWargaProps = {
  data: {
    genderData: DataPoint[];
    ageData: DataPoint[];
    rtData: DataPoint[];
    totalWarga: number;
    totalKK: number;
  };
};

function DistributionList({ data }: { data: DataPoint[] }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <ul className="space-y-4">
      {data.map((item) => {
        const width = `${Math.max((item.value / maxValue) * 100, 2)}%`;

        return (
          <li key={item.name}>
            <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium text-slate-700">{item.name}</span>
              <span className="tabular-nums font-semibold text-slate-950">{item.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-emerald-950/8" aria-hidden="true">
              <div className="h-full rounded-full bg-emerald-700" style={{ width }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function InfografisWarga({ data }: InfografisWargaProps) {
  return (
    <section className="border-y border-emerald-950/10 bg-[#f2f6f2] py-14 md:py-20" aria-labelledby="statistik-warga">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="max-w-xl">
          <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-emerald-900 text-white">
            <Users className="size-5" aria-hidden="true" />
          </div>
          <h2 id="statistik-warga" className="text-balance text-3xl font-bold text-emerald-950 md:text-4xl">
            Data warga untuk keputusan yang lebih baik
          </h2>
          <p className="mt-4 max-w-[60ch] text-pretty leading-7 text-slate-600">
            Ringkasan kependudukan RW 10 yang mudah dibaca oleh warga dan pengurus.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-emerald-950/10 bg-emerald-950/10">
            <div className="bg-white p-5">
              <dt className="text-sm font-medium text-slate-600">Warga</dt>
              <dd className="mt-2 tabular-nums text-3xl font-bold text-emerald-950">{data.totalWarga}</dd>
            </div>
            <div className="bg-white p-5">
              <dt className="text-sm font-medium text-slate-600">Keluarga</dt>
              <dd className="mt-2 tabular-nums text-3xl font-bold text-emerald-950">{data.totalKK}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-emerald-950/10 bg-emerald-950/10 sm:grid-cols-2">
          <article className="bg-white p-5 md:p-6">
            <h3 className="mb-6 text-lg font-semibold text-emerald-950">Sebaran per RT</h3>
            <DistributionList data={data.rtData} />
          </article>
          <article className="bg-white p-5 md:p-6">
            <h3 className="mb-6 text-lg font-semibold text-emerald-950">Kelompok usia</h3>
            <DistributionList data={data.ageData} />
          </article>
          <article className="bg-white p-5 md:col-span-2 md:p-6">
            <h3 className="mb-5 text-lg font-semibold text-emerald-950">Jenis kelamin</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.genderData.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg bg-[#f2f6f2] px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  <span className="tabular-nums text-lg font-bold text-emerald-950">{item.value}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
