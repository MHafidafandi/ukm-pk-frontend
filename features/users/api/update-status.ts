import { api } from "@/lib/api/client";
import { MutationConfig } from "@/lib/api/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUsers } from "./get-user";

export const activateUser = ({ id }: { id: string }) => {
  return api.patch(`/users/${id}/activate`);
};

export const deactivateUser = ({ id }: { id: string }) => {
  return api.patch(`/users/${id}/deactivate`);
};

export const markAsAlumniUser = ({ id }: { id: string }) => {
  return api.patch(`/users/${id}/mark-alumni`);
};

type activateOptions = {
  mutationConfig?: MutationConfig<typeof activateUser>;
};

type deactivateOptions = {
  mutationConfig?: MutationConfig<typeof deactivateUser>;
};

type markAsAlumniOptions = {
  mutationConfig?: MutationConfig<typeof markAsAlumniUser>;
};

export const useActivateUser = ({ mutationConfig }: activateOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateUser,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};

export const useDeactivateUser = ({
  mutationConfig,
}: deactivateOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};

export const useMarkAsAlumniUser = ({
  mutationConfig,
}: markAsAlumniOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsAlumniUser,
    ...mutationConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      mutationConfig?.onSuccess?.(...args);
    },
  });
};
