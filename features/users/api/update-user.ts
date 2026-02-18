import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { UpdateUserInput } from "@/lib/validations/users-schema";
import { useUsers } from "./get-user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const updateUser = ({
  id,
  data,
}: {
  id: string;
  data: UpdateUserInput;
}) => {
  return api.put(`/users/${id}`, data);
};

type UseUpdateUserOptions = {
  mutationConfig?: MutationConfig<typeof updateUser>;
};

export const useUpdateUser = ({
  mutationConfig,
}: UseUpdateUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
