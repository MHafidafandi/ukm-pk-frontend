import { api } from "@/lib/api/client";
import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { MutationConfig } from "@/lib/api/react-query";
import {
  CreateDocumentationInput,
  UpdateDocumentationInput,
  DocumentationType,
} from "@/lib/validations/activity-schema";

export interface Documentation {
  id: string;
  activity_id: string;
  judul: string;
  deskripsi: string;
  tipe_dokumen: DocumentationType;
  link_gdrive?: string;
  nama_file?: string;
  ukuran_file?: number;
  tipe_file?: string;
  created_at: string;
  updated_at: string;
}

// GET LIST (by activity)
export const getDocumentations = async (params: {
  activity_id: string;
}): Promise<{ data: Documentation[]; meta: any }> => {
  return api.get(`/documentations/activity/${params.activity_id}`);
  // Note: API docs say GET /api/v1/documentations/activity/:activity_id
  // But also GET /api/v1/documentations with params.
  // Using the activity specific endpoint seems safer if available.
  // Wait, API Doc says: GET /api/v1/documentations/activity/:activity_id
};

export const useDocumentations = (activity_id: string) => {
  return useQuery({
    queryKey: ["documentations", activity_id],
    queryFn: () => getDocumentations({ activity_id }),
    enabled: !!activity_id,
  });
};

// CREATE
export const createDocumentation = ({
  data,
}: {
  data: CreateDocumentationInput;
}) => {
  return api.post("/documentations", data);
};

export const useCreateDocumentation = (options?: {
  mutationConfig?: MutationConfig<typeof createDocumentation>;
}) => {
  const queryClient = useQueryClient();
  const { mutationConfig } = options || {};

  return useMutation({
    mutationFn: createDocumentation,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};

// DELETE
export const deleteDocumentation = ({ id }: { id: string }) => {
  return api.delete(`/documentations/${id}`);
};

export const useDeleteDocumentation = (options?: {
  mutationConfig?: MutationConfig<typeof deleteDocumentation>;
}) => {
  const queryClient = useQueryClient();
  const { mutationConfig } = options || {};

  return useMutation({
    mutationFn: deleteDocumentation,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["documentations"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
