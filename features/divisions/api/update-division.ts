import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const updateDivisionSchema = z.object({
  nama_divisi: z.string().min(1, "Nama divisi wajib diisi"),
  deskripsi: z.string().optional(),
});

export type UpdateDivisionInput = z.infer<typeof updateDivisionSchema>;

export const updateDivision = ({
  id,
  data,
}: {
  id: string;
  data: UpdateDivisionInput;
}) => {
  return api.put(`/divisions/${id}`, data);
};

type UseUpdateDivisionOptions = {
  mutationConfig?: MutationConfig<typeof updateDivision>;
};

export const useUpdateDivision = ({
  mutationConfig,
}: UseUpdateDivisionOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDivision,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
