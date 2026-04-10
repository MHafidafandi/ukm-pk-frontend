import { api } from "@/lib/api/client";
import { LoginInput } from "@/lib/validations/auth-schema";

type ApiPayload<T> = T | { data: T };

const unwrapPayload = <T>(payload: ApiPayload<T>): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

type AuthTokenResponse = {
  access_token: string;
  expires_in?: number;
};

export const login = async (body: LoginInput) => {
<<<<<<< HEAD
  const { data } = await api.post("/auth/login", body, {
    withCredentials: true,
  });
  return data; // { access_token, expires_in }
=======
  const payload = (await api.post("/auth/login", body, {
    withCredentials: true,
  })) as ApiPayload<AuthTokenResponse>;
  return unwrapPayload(payload);
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
};

export const getMe = async () => {
  const payload = await api.get("/auth/me");
  return unwrapPayload(payload);
};

export const refreshToken = async (refresh_token?: string) => {
  const requestBody = refresh_token ? { refresh_token } : undefined;
<<<<<<< HEAD
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
=======
  const payload = (await api.post("/auth/refresh", requestBody, {
    withCredentials: true,
  })) as ApiPayload<AuthTokenResponse>;
  return unwrapPayload(payload);
};

export const logout = async () => {
  const payload = await api.post("/auth/logout", undefined, {
    withCredentials: true,
  });
  return unwrapPayload(payload);
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
};

export const logoutAll = async (userId: string) => {
  const payload = await api.post(`/auth/${userId}/logout-all`);
  return unwrapPayload(payload);
};

export const updateProfile = async (body: any) => {
<<<<<<< HEAD
  const { data } = await api.put("/users/me", body);
  return data;
=======
  const payload = await api.put("/users/me", body);
  return unwrapPayload(payload);
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
};

export const changePassword = async (body: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) => {
<<<<<<< HEAD
  const { data } = await api.put("/users/me/password", body);
  return data;
=======
  const payload = await api.put("/users/me/password", body);
  return unwrapPayload(payload);
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
<<<<<<< HEAD
  const { data } = await api.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteAvatar = async () => {
  const { data } = await api.delete("/users/me/avatar");
  return data;
=======
  const payload = await api.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrapPayload(payload);
};

export const deleteAvatar = async () => {
  const payload = await api.delete("/users/me/avatar");
  return unwrapPayload(payload);
>>>>>>> d1006d5a3f81168775557fa0498b538d3dcbbd83
};
