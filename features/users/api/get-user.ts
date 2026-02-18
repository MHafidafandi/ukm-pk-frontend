/* eslint-disable @typescript-eslint/no-explicit-any */
import { queryOptions, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { QueryConfig } from "@/lib/api/react-query";
import { User } from "@/contexts/AuthContext";

interface UsersResponse {
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      total_pages: number;
      page_size: number;
      has_next: boolean;
      has_previous: boolean;
    };
    filters: Record<string, any>;
  };
}
export type UsersParams = {
  Page?: number;
  Limit?: number;
  Order?: string;
  Sort?: string;
  Search?: string;
  Status?: string;
  DivisionID?: string;
  Angkatan?: number;
  RoleID?: string;
};

export const getUsers = (params: UsersParams = {}): Promise<UsersResponse> => {
  return api.get(`/users`, { params });
};

export const getUsersQueryOptions = (params: UsersParams = {}) => {
  return queryOptions({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
};

type UseUsersOptions = {
  params?: UsersParams;
  queryConfig?: QueryConfig<typeof getUsersQueryOptions>;
};

export const useUsers = ({
  params = {},
  queryConfig,
}: UseUsersOptions = {}) => {
  return useQuery({
    ...getUsersQueryOptions(params),
    ...queryConfig,
  });
};
