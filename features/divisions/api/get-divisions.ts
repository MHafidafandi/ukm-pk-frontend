import { api } from "@/lib/api/client";
import { QueryConfig } from "@/lib/api/react-query";
import { useQuery } from "@tanstack/react-query";

export interface DivisionsResponse {
  data: {
    id: string;
    nama_divisi: string;
    deskripsi: string;
    created_at: string;
    updated_at: string;
  }[];
}

export const getDivisions = (): Promise<DivisionsResponse> => {
  return api.get("/divisions");
};

export const getDivisionsQueryOptions = () => {
  return {
    queryKey: ["divisions"],
    queryFn: getDivisions,
  };
};

type useDivisionsOptions = {
  queryConfig?: QueryConfig<typeof getDivisionsQueryOptions>;
};
export const useDivisions = (options?: useDivisionsOptions) => {
  return useQuery({
    ...getDivisionsQueryOptions(),
    ...options,
  });
};
