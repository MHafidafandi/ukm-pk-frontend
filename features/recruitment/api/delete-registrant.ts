import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const deleteRegistrant = ({
  recruitmentId,
  registrantId,
}: {
  recruitmentId: string;
  registrantId: string;
}) => {
  return api.delete(
    `/recruitments/${recruitmentId}/registrants/${registrantId}`,
  );
};

type UseDeleteRegistrantOptions = {
  mutationConfig?: MutationConfig<typeof deleteRegistrant>;
};

export const useDeleteRegistrant = ({
  mutationConfig,
}: UseDeleteRegistrantOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRegistrant,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["registrants"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
