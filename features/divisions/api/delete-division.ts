import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const deleteDivision = ({ id }: { id: string }) => {
  return api.delete(`/divisions/${id}`);
};

type UseDeleteDivisionOptions = {
  mutationConfig?: MutationConfig<typeof deleteDivision>;
};

export const useDeleteDivision = ({
  mutationConfig,
}: UseDeleteDivisionOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDivision,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
