import { api } from "@/lib/api/client";
import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { MutationConfig } from "@/lib/api/react-query";
import {
  CreateProgressReportInput,
  UpdateProgressReportInput,
} from "@/lib/validations/activity-schema";

export interface ProgressReport {
  id: string;
  activity_id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  created_at: string;
  updated_at: string;
}

// GET LIST
export const getProgressReports = async (params?: {
  activity_id?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ProgressReport[]; meta: any }> => {
  return api.get("/progress-reports", { params });
};

export const useProgressReports = (params?: {
  activity_id?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["progress-reports", params],
    queryFn: () => getProgressReports(params),
    enabled: !!params?.activity_id,
  });
};

// CREATE
export const createProgressReport = ({
  data,
}: {
  data: CreateProgressReportInput;
}) => {
  return api.post("/progress-reports", data);
};

export const useCreateProgressReport = (options?: {
  mutationConfig?: MutationConfig<typeof createProgressReport>;
}) => {
  const queryClient = useQueryClient();
  const { mutationConfig } = options || {};

  return useMutation({
    mutationFn: createProgressReport,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["progress-reports"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};

// UPDATE
export const updateProgressReport = ({
  id,
  data,
}: {
  id: string;
  data: UpdateProgressReportInput;
}) => {
  return api.put(`/progress-reports/${id}`, data);
};

export const useUpdateProgressReport = (options?: {
  mutationConfig?: MutationConfig<typeof updateProgressReport>;
}) => {
  const queryClient = useQueryClient();
  const { mutationConfig } = options || {};

  return useMutation({
    mutationFn: updateProgressReport,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["progress-reports"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};

// DELETE
export const deleteProgressReport = ({ id }: { id: string }) => {
  return api.delete(`/progress-reports/${id}`);
};

export const useDeleteProgressReport = (options?: {
  mutationConfig?: MutationConfig<typeof deleteProgressReport>;
}) => {
  const queryClient = useQueryClient();
  const { mutationConfig } = options || {};

  return useMutation({
    mutationFn: deleteProgressReport,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["progress-reports"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
