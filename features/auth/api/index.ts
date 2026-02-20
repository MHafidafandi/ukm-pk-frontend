/**
 * Auth API functions — pure API calls, no React Query.
 */
import { api } from "@/lib/api/client";
import { LoginInput } from "../../../lib/validations/auth-schema"; // Nantinya bisa dipindah ke features/auth/types

// ── Types ──────────────────────────────────────────────────────────────────

export interface AuthBody {
  data: {
    access_token: string;
    expires_in: number;
  };
}

import { User } from "@/contexts/AuthContext";

export interface MeBody {
  data: User;
}

// ── API Functions ──────────────────────────────────────────────────────────

import { MOCK_USERS } from "@/features/users/data/mock-users";

const USE_MOCK = false; // Set to false to use real API

export const loginWithEmailAndPassword = async (
  data: LoginInput,
): Promise<AuthBody> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simple mock login: check if email exists in mock users
    const user = MOCK_USERS.find((u) => u.email === data.email);

    if (user) {
      if (data.password === "password") {
        // Simple password check for mock
        return {
          data: {
            access_token: "mock-access-token-" + user.id,
            expires_in: 3600,
          },
        };
      }
    }

    // If not found or wrong password (in a real mock we might want to be more specific)
    // But for tailored testing, let's just allow login if email matches specific mock ones or any
    // Falback to finding ANY user if email is generic? No, strict email match is better.

    if (data.email === "admin@example.com") {
      return {
        data: {
          access_token: "mock-access-token-admin",
          expires_in: 3600,
        },
      };
    }
  }

  return api.post("/auth/login", data) as unknown as Promise<AuthBody>;
};

export const refreshToken = (): Promise<AuthBody> => {
  return api.post("/auth/refresh") as unknown as Promise<AuthBody>;
};

export const logout = (): Promise<void> => {
  return api.post("/auth/logout") as unknown as Promise<void>;
};

export const getMe = async (): Promise<any> => {
  if (USE_MOCK) {
    // Return the first mock user or simulate based on token if we could access it here
    // For simplicity, let's return a specific mock user, e.g. the first one (Admin usually)
    // Or we could try to parse the 'mock-access-token-ID' from localStorage if we had access, but api functions are pure.
    // Let's just return the first user for now.
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_USERS[0];
  }
  const body = (await api.get("/auth/me")) as unknown as MeBody;
  return body.data;
};

export const updateProfile = (data: any): Promise<MeBody> => {
  return api.put("/auth/me", data) as unknown as Promise<MeBody>;
};

export const updatePassword = (data: {
  old_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<void> => {
  return api.put("/auth/me/password", data) as unknown as Promise<void>;
};
