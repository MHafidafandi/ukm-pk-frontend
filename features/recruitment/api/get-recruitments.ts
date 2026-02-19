import { api } from "@/lib/api/client";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { RecruitmentStatus } from "@/lib/validations/recruitment-schema";

export interface Recruitment {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: RecruitmentStatus;
  requirements?: string[];
  created_at: string;
  updated_at: string;
  _count?: {
    registrants: number;
  };
}

export interface RecruitmentListResponse {
  data: Recruitment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_page: number;
  };
}

export const getRecruitments = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<RecruitmentListResponse> => {
  return api.get("/recruitments", { params });
};

export const getRecruitmentsQueryOptions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return queryOptions({
    queryKey: ["recruitments", params],
    queryFn: () => getRecruitments(params),
  });
};

export const useRecruitments = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return useQuery(getRecruitmentsQueryOptions(params));
};

export const getRecruitment = async ({
  id,
}: {
  id: string;
}): Promise<Recruitment> => {
  return api.get(`/recruitments/${id}`);
};

export const useRecruitment = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["recruitments", id],
    queryFn: () => getRecruitment({ id }),
    enabled: !!id,
  });
};
