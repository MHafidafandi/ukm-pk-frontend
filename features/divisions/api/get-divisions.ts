import { api } from "@/lib/api/client";
import { queryOptions, useQuery } from "@tanstack/react-query";

export interface Division {
  id: string;
  nama_divisi: string;
  description: string;
  created_at: string;
  updated_at: string;
  _count?: {
    users: number;
  };
}

export interface DivisionListResponse {
  data: Division[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_page: number;
  };
}

export const getDivisions = async (): Promise<DivisionListResponse> => {
  return api.get("/divisions");
};

export const getDivisionQueryOptions = () => {
  return queryOptions({
    queryKey: ["divisions"],
    queryFn: getDivisions,
  });
};

export const useDivisions = () => {
  return useQuery(getDivisionQueryOptions());
};

export const getDivision = async ({
  id,
}: {
  id: string;
}): Promise<Division> => {
  return api.get(`/divisions/${id}`);
};

export const useDivision = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["divisions", id],
    queryFn: () => getDivision({ id }),
    enabled: !!id,
  });
};

export const getDivisionUsers = async ({
  id,
}: {
  id: string;
}): Promise<any> => {
  return api.get(`/divisions/${id}/users`);
};

export const useDivisionUsers = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["division-users", id],
    queryFn: () => getDivisionUsers({ id }),
    enabled: !!id,
  });
};
