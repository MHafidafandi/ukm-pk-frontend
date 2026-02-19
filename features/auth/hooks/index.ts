import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  loginWithEmailAndPassword,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  updatePassword,
} from "../api";

import { getErrorMessage, setToken } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Query Keys ─────────────────────────────────────────────────────────────

export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// ── User Query ─────────────────────────────────────────────────────────────

export const getUserQueryOptions = () => {
  return queryOptions({
    queryKey: authKeys.user(),
    queryFn: getMe,
  });
};

export const useUserQuery = () => useQuery(getUserQueryOptions());

// ── Mutations ──────────────────────────────────────────────────────────────

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
      onError?.(getErrorMessage(error));
    },
    onSuccess: async (data) => {
      const token = data.data.access_token;

      // Fetch user data immediately to populate context
      // Note: We could use the response if it included user data, but currrently login returns only token
      // So we fetch user manually or rely on what we have.
      // Based on auth-service.ts logic:
      setToken(token); // Set token agar getMe authenticated
      const user = await getMe(); // pure API call

      login(user, token); // Update context

      queryClient.setQueryData(authKeys.user(), user); // Update cache
      onSuccess?.();
    },
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  const { login } = useAuth();

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: async (data) => {
      const token = data.data.access_token;
      const user = await getMe();
      login(user, token);
      queryClient.setQueryData(authKeys.user(), user);
    },
  });
};

export const useLogout = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const { logout: contextLogout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      contextLogout();
      queryClient.clear(); // Clear all cache on logout
      onSuccess?.();
    },
  });
};

export const useUpdateProfile = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // API updateProfile returns { data: User } wrapped in MeBody
      const user = data.data;
      queryClient.setQueryData(authKeys.user(), user);
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(getErrorMessage(error));
    },
  });
};

export const useUpdatePassword = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(getErrorMessage(error));
    },
  });
};
