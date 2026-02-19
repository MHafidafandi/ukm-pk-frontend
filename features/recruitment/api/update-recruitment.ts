import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateRecruitmentInput } from "@/lib/validations/recruitment-schema";

export const updateRecruitment = ({
  id,
  data,
}: {
  id: string;
  data: UpdateRecruitmentInput;
}) => {
  return api.put(`/recruitments/${id}`, data);
};

type UseUpdateRecruitmentOptions = {
  mutationConfig?: MutationConfig<typeof updateRecruitment>;
};

export const useUpdateRecruitment = ({
  mutationConfig,
}: UseUpdateRecruitmentOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRecruitment,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
