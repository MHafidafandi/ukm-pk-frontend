// features/landing-page/services/publicOverviewService.ts
// Update fungsi getPublicActivities agar support parameter featured

import { api } from "@/lib/api/client";

export interface PublicActivity {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  status: string;
  thumbnail?: string;
  is_featured?: boolean;
}

export interface PublicActivitiesResponse {
  activities: PublicActivity[];
  total: number;
}

/**
 * Fetch aktivitas untuk landing page.
 * @param limit  Jumlah maksimal aktivitas
 * @param featured  true = hanya yang is_featured, false/undefined = semua (terbaru)
 */
export async function getPublicActivities(
  limit = 3,
  featured?: boolean,
): Promise<PublicActivitiesResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    order: "desc",
    sort: "created_at",
  });

  if (featured === true) {
    params.set("featured", "true");
  }

  const data = await api.get(`/activities?${params.toString()}`);

  // Response dari BE: { data: { activities: [...], pagination: { total } } }
  const activities: PublicActivity[] = data?.data?.activities ?? [];
  const total: number = data?.data?.pagination?.total ?? 0;

  return { activities, total };
}
