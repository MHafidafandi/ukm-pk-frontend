import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const deleteUser = async ({ id }: { id: string }) => {
  return api.delete(`/users/${id}`);
};

type UseDeleteUserOptions = {
  mutationConfig?: MutationConfig<typeof deleteUser>;
};
export const useDeleteUser = ({
  mutationConfig,
}: UseDeleteUserOptions = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
