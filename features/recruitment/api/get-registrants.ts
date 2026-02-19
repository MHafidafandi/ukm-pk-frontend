import { api } from "@/lib/api/client";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { RegistrantStatus } from "@/lib/validations/recruitment-schema";
import { User } from "@/contexts/AuthContext";

export interface Registrant {
  id: string;
  recruitment_id: string;
  user_id: string;
  status: RegistrantStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface RegistrantListResponse {
  data: Registrant[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_page: number;
  };
}

export const getRegistrants = async ({
  recruitmentId,
  params,
}: {
  recruitmentId: string;
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  };
}): Promise<RegistrantListResponse> => {
  return api.get(`/recruitments/${recruitmentId}/registrants`, { params });
};

export const getRegistrantsQueryOptions = (
  recruitmentId: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  },
) => {
  return queryOptions({
    queryKey: ["registrants", recruitmentId, params],
    queryFn: () => getRegistrants({ recruitmentId, params }),
    enabled: !!recruitmentId,
  });
};

export const useRegistrants = (
  recruitmentId: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  },
) => {
  return useQuery(getRegistrantsQueryOptions(recruitmentId, params));
};
