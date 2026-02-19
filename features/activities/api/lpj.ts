import { api } from "@/lib/api/client";
import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { MutationConfig } from "@/lib/api/react-query";
import { CreateLpjInput } from "@/lib/validations/activity-schema";

export interface LPJ {
  id: string;
  activity_id: string;
  tanggal: string;
  created_at: string;
  updated_at: string;
}

// GET (by activity)
export const getLpjByActivity = async (
  activity_id: string,
): Promise<{ message: string; lpj: LPJ[] }> => {
  return api.get(`/lpj/activity/${activity_id}`);
};

export const useLpjByActivity = (activity_id: string) => {
  return useQuery({
    queryKey: ["lpj", activity_id],
    queryFn: () => getLpjByActivity(activity_id),
    enabled: !!activity_id,
  });
};

// CREATE
export const createLpj = ({ data }: { data: CreateLpjInput }) => {
  return api.post("/lpj", data);
};

export const useCreateLpj = (options?: {
  mutationConfig?: MutationConfig<typeof createLpj>;
}) => {
  const queryClient = useQueryClient();
  const { mutationConfig } = options || {};

  return useMutation({
    mutationFn: createLpj,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["lpj"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};

// DELETE
export const deleteLpj = ({ id }: { id: string }) => {
  return api.delete(`/lpj/${id}`);
};

export const useDeleteLpj = (options?: {
  mutationConfig?: MutationConfig<typeof deleteLpj>;
}) => {
  const queryClient = useQueryClient();
  const { mutationConfig } = options || {};

  return useMutation({
    mutationFn: deleteLpj,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["lpj"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
