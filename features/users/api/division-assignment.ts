import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const assignUserDivision = ({
  id,
  divisionId,
}: {
  id: string;
  divisionId: string;
}) => {
  return api.post(`/users/${id}/division/assign`, { division_id: divisionId });
};

type UseAssignUserDivisionOptions = {
  mutationConfig?: MutationConfig<typeof assignUserDivision>;
};

export const useAssignUserDivision = ({
  mutationConfig,
}: UseAssignUserDivisionOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignUserDivision,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
