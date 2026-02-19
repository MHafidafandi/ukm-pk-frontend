import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RegisterRecruitmentInput } from "@/lib/validations/recruitment-schema";

export const registerRecruitment = ({
  id,
  data,
}: {
  id: string;
  data: RegisterRecruitmentInput;
}) => {
  return api.post(`/recruitments/${id}/register`, data);
};

type UseRegisterRecruitmentOptions = {
  mutationConfig?: MutationConfig<typeof registerRecruitment>;
};

export const useRegisterRecruitment = ({
  mutationConfig,
}: UseRegisterRecruitmentOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerRecruitment,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] }); // refresh recruitments (maybe counts update)
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] }); // if we have this
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
