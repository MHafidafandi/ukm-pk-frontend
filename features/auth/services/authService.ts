import { api } from "@/lib/api/client";
import { LoginInput } from "@/lib/validations/auth-schema";

export const login = async (body: LoginInput) => {
  const { data } = await api.post("/auth/login", body);
  return data.data; // { access_token, expires_in }
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data.data;
};

export const refreshToken = async (refresh_token?: string) => {
  const { data } = await api.post("/auth/refresh", { refresh_token });
  return data.data; // { access_token, expires_in }
};

export const logout = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const logoutAll = async (userId: string) => {
  const { data } = await api.post(`/auth/${userId}/logout-all`);
  return data;
};

export const updateProfile = async (body: any) => {
  const { data } = await api.put("/auth/me", body);
  return data;
};

export const changePassword = async (body: any) => {
  const { data } = await api.put("/auth/me/password", body);
  return data;
};
