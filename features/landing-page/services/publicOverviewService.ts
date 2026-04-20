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

export interface PublicActivityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: "ASC" | "DESC";
}

export async function getPublicActivities(
  params?: PublicActivityQueryParams,
): Promise<PublicActivitiesResponse> {
  const data = await api.get(`/activities`, { params });

  const activities: PublicActivity[] =
    data?.data?.activities ?? data?.data ?? [];
  const total: number = data?.data?.pagination?.total ?? activities.length;

  return { activities, total };
}

export async function getPublicActivity(id: string): Promise<PublicActivity> {
  const data = await api.get(`/activities/${id}`);
  return data?.data ?? data;
}
