import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const updateRoleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const updateRole = ({
  id,
  data,
}: {
  id: string;
  data: UpdateRoleInput;
}) => {
  return api.put(`/roles/${id}`, data);
};

type UseUpdateRoleOptions = {
  mutationConfig?: MutationConfig<typeof updateRole>;
};

export const useUpdateRole = ({
  mutationConfig,
}: UseUpdateRoleOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRole,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
