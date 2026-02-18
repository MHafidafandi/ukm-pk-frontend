import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { CreateUserInput } from "@/lib/validations/users-schema";
import { useUsers } from "./get-user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const createUser = async ({ data }: { data: CreateUserInput }) => {
  return api.post("/users", data);
};

type UseCreateUserOptions = {
  mutationConfig?: MutationConfig<typeof createUser>;
};

export const useCreateUser = ({
  mutationConfig,
}: UseCreateUserOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
