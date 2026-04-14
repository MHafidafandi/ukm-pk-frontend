import { api } from "@/lib/api/client";
import { DashboardResponse } from "../types/dashboardTypes";

export async function getDashboardStats(): Promise<DashboardResponse> {
  const data = await api.get("/dashboard");
  return data;
}
