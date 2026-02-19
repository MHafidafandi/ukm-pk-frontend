import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const deleteActivity = ({ id }: { id: string }) => {
  return api.delete(`/activities/${id}`);
};

type UseDeleteActivityOptions = {
  mutationConfig?: MutationConfig<typeof deleteActivity>;
};

export const useDeleteActivity = ({
  mutationConfig,
}: UseDeleteActivityOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
