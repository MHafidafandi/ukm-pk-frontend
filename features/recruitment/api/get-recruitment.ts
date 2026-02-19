import { api } from "@/lib/api/client";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { Recruitment } from "./get-recruitments";

export const getRecruitment = async ({
  id,
}: {
  id: string;
}): Promise<Recruitment> => {
  return api.get(`/recruitments/${id}`);
};

export const getRecruitmentQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ["recruitments", id],
    queryFn: () => getRecruitment({ id }),
    enabled: !!id,
  });
};

export const useRecruitment = ({ id }: { id: string }) => {
  return useQuery(getRecruitmentQueryOptions(id));
};
