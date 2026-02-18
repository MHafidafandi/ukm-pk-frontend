/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { QueryConfig } from "@/lib/api/react-query";

/* ====== TYPES ====== */

export interface UsersStatsResponse {
  data: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    alumni_users: number;

    users_by_division: {
      division_id: string;
      division_name: string;
      user_count: number;
      percentage: string;
    }[];

    users_by_angkatan: Record<string, number>;
    users_by_status: Record<string, number>;

    monthly_growth: any;
    recent_registrations: any[];
  };
}

/* ====== API ====== */

export const getUsersStats = (): Promise<UsersStatsResponse> => {
  return api.get("/users/statistics");
};

/* ====== QUERY OPTIONS ====== */

export const getUsersStatsQueryOptions = () => {
  return queryOptions({
    queryKey: ["users-stats"],
    queryFn: getUsersStats,
  });
};

/* ====== HOOK ====== */

type UseUsersStatsOptions = {
  queryConfig?: QueryConfig<typeof getUsersStatsQueryOptions>;
};

export const useUsersStats = ({ queryConfig }: UseUsersStatsOptions = {}) => {
  return useQuery({
    ...getUsersStatsQueryOptions(),
    ...queryConfig,
  });
};
