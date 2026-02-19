import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const createDivisionSchema = z.object({
  nama_divisi: z.string().min(1, "Nama divisi wajib diisi"),
  deskripsi: z.string().optional(),
});

export type CreateDivisionInput = z.infer<typeof createDivisionSchema>;

export const createDivision = ({ data }: { data: CreateDivisionInput }) => {
  return api.post("/divisions", data);
};

type UseCreateDivisionOptions = {
  mutationConfig?: MutationConfig<typeof createDivision>;
};

export const useCreateDivision = ({
  mutationConfig,
}: UseCreateDivisionOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDivision,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
