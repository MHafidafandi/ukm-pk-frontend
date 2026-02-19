import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateActivityInput } from "@/lib/validations/activity-schema";

export const updateActivity = ({
  id,
  data,
}: {
  id: string;
  data: UpdateActivityInput;
}) => {
  return api.put(`/activities/${id}`, data);
};

type UseUpdateActivityOptions = {
  mutationConfig?: MutationConfig<typeof updateActivity>;
};

export const useUpdateActivity = ({
  mutationConfig,
}: UseUpdateActivityOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateActivity,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
