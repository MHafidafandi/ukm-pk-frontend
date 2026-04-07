import { api } from "@/lib/api/client";
import { LoginInput } from "@/lib/validations/auth-schema";

export const login = async (body: LoginInput) => {
  const { data } = await api.post("/auth/login", body, {
    withCredentials: true,
  });
  return data; // { access_token, expires_in }
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const refreshToken = async (refresh_token?: string) => {
  const requestBody = refresh_token ? { refresh_token } : undefined;
  const { data } = await api.post("/auth/refresh", requestBody, {
    withCredentials: true,
  });
  return data; // { access_token, expires_in }
};

export const logout = async () => {
  const { data } = await api.post("/auth/logout", undefined, {
    withCredentials: true,
  });
  return data;
};

export const logoutAll = async (userId: string) => {
  const { data } = await api.post(`/auth/${userId}/logout-all`);
  return data;
};

export const updateProfile = async (body: any) => {
  const { data } = await api.put("/users/me", body);
  return data;
};

export const changePassword = async (body: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) => {
  const { data } = await api.put("/users/me/password", body);
  return data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await api.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteAvatar = async () => {
  const { data } = await api.delete("/users/me/avatar");
  return data;
};
