import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "./client";
import { useAuth, User } from "@/contexts/AuthContext";
import { LoginInput } from "../validations/auth-schema";

interface AuthResponse {
  data: {
    access_token: string;
    expires_in: number;
  };
}

export const getUser = async (): Promise<User> => {
  const response = (await api.get("/auth/me")) as { data: User };

  return response.data;
};

const userQueryKey = ["user"];

export const getUserQueryOptions = () => {
  return queryOptions({
    queryKey: userQueryKey,
    queryFn: getUser,
  });
};

export const useUser = () => useQuery(getUserQueryOptions());

export const useLogin = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  const queryClient = useQueryClient();
  const { login } = useAuth();
  return useMutation({
    mutationFn: loginWithEmailAndPassword,
    onError: (error: Error) => {
      onError?.(error.message);
    },
    onSuccess: async (data) => {
      const token = data.data.access_token;

      localStorage.setItem("access_token", token);

      const user = await getUser();

      login(user, token);

      queryClient.setQueryData(userQueryKey, user);
      onSuccess?.();
    },
  });
};

const loginWithEmailAndPassword = (data: LoginInput): Promise<AuthResponse> => {
  return api.post("/auth/login", data);
};
