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

export const loginWithEmailAndPassword = (
  data: LoginInput,
): Promise<AuthBody> => {
  return api.post("/auth/login", data) as unknown as Promise<AuthBody>;
};

export const refreshToken = (): Promise<AuthBody> => {
  return api.post("/auth/refresh") as unknown as Promise<AuthBody>;
};

export const logout = (): Promise<void> => {
  return api.post("/auth/logout") as unknown as Promise<void>;
};

export const getMe = async (): Promise<any> => {
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
