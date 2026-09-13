import "server-only";

import { unstable_cache } from "next/cache";
import { createAdminClient } from './admin';

type WargaSelectFields = string;

/**
 * Fetch semua data warga menggunakan pagination (batch 1000).
 * Mengatasi batas default PostgREST 1000 baris per request.
 */
export async function fetchAllWarga(fields: WargaSelectFields, rtFilter?: string) {
  const adminSupabase = createAdminClient();
  const PAGE_SIZE = 1000;
  let allData: Record<string, unknown>[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    let query = adminSupabase
      .from('warga')
      .select(fields)
      .range(from, from + PAGE_SIZE - 1)
      .order('id', { ascending: true });

    if (rtFilter) {
      query = query.eq('rt', rtFilter);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      hasMore = false;
    } else {
      allData = [...allData, ...(data as unknown as Record<string, unknown>[])];
      from += PAGE_SIZE;
      // Kalau hasil < PAGE_SIZE, berarti sudah habis
      if ((data as unknown[]).length < PAGE_SIZE) hasMore = false;
    }
  }

  return allData;
}

export const fetchWargaStatisticsRows = unstable_cache(
  () => fetchAllWarga("rt,jenis_kelamin,tanggal_lahir,no_kk"),
  ["warga-statistics-rows"],
  { revalidate: 300, tags: ["warga-statistics"] },
);
