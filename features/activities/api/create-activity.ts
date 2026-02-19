import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateActivityInput } from "@/lib/validations/activity-schema";

export const createActivity = ({ data }: { data: CreateActivityInput }) => {
  return api.post("/activities", data);
};

type UseCreateActivityOptions = {
  mutationConfig?: MutationConfig<typeof createActivity>;
};

export const useCreateActivity = ({
  mutationConfig,
}: UseCreateActivityOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivity,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
