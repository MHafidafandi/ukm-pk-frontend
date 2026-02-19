import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const assignUserRole = ({
  id,
  roleIds,
}: {
  id: string;
  roleIds: string[];
}) => {
  return api.post(`/users/${id}/roles/assign`, { role_ids: roleIds });
};

export const removeUserRole = ({
  id,
  roleIds,
}: {
  id: string;
  roleIds: string[];
}) => {
  return api.delete(`/users/${id}/roles/remove?role_ids=${roleIds.join(",")}`);
};

type UseAssignUserRoleOptions = {
  mutationConfig?: MutationConfig<typeof assignUserRole>;
};

type UseRemoveUserRoleOptions = {
  mutationConfig?: MutationConfig<typeof removeUserRole>;
};

export const useAssignUserRole = ({
  mutationConfig,
}: UseAssignUserRoleOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignUserRole,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};

export const useRemoveUserRole = ({
  mutationConfig,
}: UseRemoveUserRoleOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUserRole,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};

export const getUserRoles = async ({ id }: { id: string }): Promise<any> => {
  return api.get(`/users/${id}/roles`);
};

export const useUserRoles = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["user-roles", id],
    queryFn: () => getUserRoles({ id }),
    enabled: !!id,
  });
};

export const updateUserRoles = ({
  id,
  roleIds,
}: {
  id: string;
  roleIds: string[];
}) => {
  return api.put(`/users/${id}/roles`, { role_ids: roleIds });
};

export const useUpdateUserRoles = ({
  mutationConfig,
}: {
  mutationConfig?: MutationConfig<typeof updateUserRoles>;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRoles,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
