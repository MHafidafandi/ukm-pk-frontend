import { api } from "@/lib/api/client";
import { queryOptions, useQuery } from "@tanstack/react-query";

export interface DivisionStats {
  id: string;
  name: string;
  member_count: number;
  active_member_count: number;
  alumni_member_count: number;
}

export const getDivisionStats = async ({
  id,
}: {
  id: string;
}): Promise<DivisionStats> => {
  return api.get(`/divisions/${id}/member-stats`);
};

export const useDivisionStats = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["division-stats", id],
    queryFn: () => getDivisionStats({ id }),
    enabled: !!id,
  });
};

export const getDivisionsStatistics = async (): Promise<any> => {
  return api.get("/divisions/statistics");
};

export const useDivisionsStatistics = () => {
  return useQuery({
    queryKey: ["divisions-statistics"],
    queryFn: getDivisionsStatistics,
  });
};
