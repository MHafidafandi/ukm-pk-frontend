import { api } from "@/lib/api/client";
import { queryOptions, useQuery } from "@tanstack/react-query";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
  _count?: {
    users: number;
  };
}

export interface RoleListResponse {
  data: Role[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_page: number;
  };
}

export const getRoles = async (): Promise<RoleListResponse> => {
  return api.get("/roles");
};

export const getRolesQueryOptions = () => {
  return queryOptions({
    queryKey: ["roles"],
    queryFn: getRoles,
  });
};

export const useRoles = () => {
  return useQuery(getRolesQueryOptions());
};

export const getRole = async ({ id }: { id: string }): Promise<Role> => {
  return api.get(`/roles/${id}`);
};

export const useRole = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: () => getRole({ id }),
    enabled: !!id,
  });
};
