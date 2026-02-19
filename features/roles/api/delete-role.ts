import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const deleteRole = ({ id }: { id: string }) => {
  return api.delete(`/roles/${id}`);
};

type UseDeleteRoleOptions = {
  mutationConfig?: MutationConfig<typeof deleteRole>;
};

export const useDeleteRole = ({
  mutationConfig,
}: UseDeleteRoleOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
