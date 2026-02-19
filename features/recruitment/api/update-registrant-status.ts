import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateRegistrantStatusInput } from "@/lib/validations/recruitment-schema";

export const updateRegistrantStatus = ({
  recruitmentId,
  registrantId,
  data,
}: {
  recruitmentId: string;
  registrantId: string;
  data: UpdateRegistrantStatusInput;
}) => {
  return api.patch(
    `/recruitments/${recruitmentId}/registrants/${registrantId}/status`,
    data,
  );
};

type UseUpdateRegistrantStatusOptions = {
  mutationConfig?: MutationConfig<typeof updateRegistrantStatus>;
};

export const useUpdateRegistrantStatus = ({
  mutationConfig,
}: UseUpdateRegistrantStatusOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRegistrantStatus,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["registrants"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
