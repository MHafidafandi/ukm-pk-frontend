import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateRecruitmentInput } from "@/lib/validations/recruitment-schema";

export const createRecruitment = ({
  data,
}: {
  data: CreateRecruitmentInput;
}) => {
  return api.post("/recruitments", data);
};

type UseCreateRecruitmentOptions = {
  mutationConfig?: MutationConfig<typeof createRecruitment>;
};

export const useCreateRecruitment = ({
  mutationConfig,
}: UseCreateRecruitmentOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecruitment,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["recruitments"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
