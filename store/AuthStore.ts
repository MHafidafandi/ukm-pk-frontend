import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserRole {
  isAdmin: boolean;
}

interface User {
  email: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  userRole: UserRole | null;
  isLoading: boolean;

  setUser: (user: User | null, token: string | null) => void;
  setUserRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      userRole: null,
      isLoading: true,

      setUser: (user, token) =>
        set({
          user,
          token,
        }),

      setUserRole: (role) =>
        set({
          userRole: role,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          userRole: null,
        }),
    }),
    {
      name: "auth-storage",

      // ✅ Aman untuk SSR
      storage: createJSONStorage(() => localStorage),

      // ✅ Setelah rehydrate
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ isLoading: false });
      },
    },
  ),
);
