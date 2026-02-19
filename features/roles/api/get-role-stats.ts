import { api } from "@/lib/api/client";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getRoleStats = async (): Promise<any> => {
  return api.get("/roles/statistics");
};

export const useRoleStats = () => {
  return useQuery({
    queryKey: ["roles-statistics"],
    queryFn: getRoleStats,
  });
};
