import { api } from "@/lib/api/client";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { ActivityStatus } from "@/lib/validations/activity-schema";

export interface Activity {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityListResponse {
  data: Activity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_page: number;
  };
}

export const getActivities = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<ActivityListResponse> => {
  return api.get("/activities", { params });
};

export const getActivitiesQueryOptions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return queryOptions({
    queryKey: ["activities", params],
    queryFn: () => getActivities(params),
  });
};

export const useActivities = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return useQuery(getActivitiesQueryOptions(params));
};

export const getActivity = async ({
  id,
}: {
  id: string;
}): Promise<Activity> => {
  return api.get(`/activities/${id}`);
};

export const useActivity = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["activities", id],
    queryFn: () => getActivity({ id }),
    enabled: !!id,
  });
};
