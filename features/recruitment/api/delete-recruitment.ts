import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const deleteRecruitment = ({ id }: { id: string }) => {
  return api.delete(`/recruitments/${id}`);
};

type UseDeleteRecruitmentOptions = {
  mutationConfig?: MutationConfig<typeof deleteRecruitment>;
};

export const useDeleteRecruitment = ({
  mutationConfig,
}: UseDeleteRecruitmentOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecruitment,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
