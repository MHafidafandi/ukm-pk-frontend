import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const createRole = ({ data }: { data: CreateRoleInput }) => {
  return api.post("/roles", data);
};

type UseCreateRoleOptions = {
  mutationConfig?: MutationConfig<typeof createRole>;
};

export const useCreateRole = ({
  mutationConfig,
}: UseCreateRoleOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRole,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
