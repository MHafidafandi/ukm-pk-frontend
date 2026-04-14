// lib/services/selectService.ts
// Shared service for all /select dropdown endpoints

import { api } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface SelectOption {
  id: string;
  name: string;
}

// ── API calls ──────────────────────────────────────────────────────────────────
async function fetchSelect(endpoint: string): Promise<SelectOption[]> {
  const res: any = await api.get(endpoint);
  // Handle both { data: [...] } and direct array responses
  const items = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
  return items.map((item: any) => ({
    id: item.id ?? item.ID ?? "",
    name:
      item.name ??
      item.nama ??
      item.title ??
      item.judul ??
      item.full_name ??
      item.label ??
      "",
  }));
}

export const selectApi = {
  activities: () => fetchSelect("/activities/select"),
  recruitments: () => fetchSelect("/recruitments/select"),
  roles: () => fetchSelect("/roles/select"),
  divisions: () => fetchSelect("/divisions/select"),
  users: () => fetchSelect("/users/select"),
  usersActive: () => fetchSelect("/users/select-active"),
};

// ── Query keys ─────────────────────────────────────────────────────────────────
const selectKeys = {
  activities: ["select", "activities"] as const,
  recruitments: ["select", "recruitments"] as const,
  roles: ["select", "roles"] as const,
  divisions: ["select", "divisions"] as const,
  users: ["select", "users"] as const,
  usersActive: ["select", "users-active"] as const,
};

// ── React-Query hooks ──────────────────────────────────────────────────────────
const STALE_TIME = 5 * 60_000; // 5 minutes

export function useActivitiesSelect(enabled = true) {
  return useQuery({
    queryKey: selectKeys.activities,
    queryFn: selectApi.activities,
    staleTime: STALE_TIME,
    enabled,
  });
}

export function useRecruitmentsSelect(enabled = true) {
  return useQuery({
    queryKey: selectKeys.recruitments,
    queryFn: selectApi.recruitments,
    staleTime: STALE_TIME,
    enabled,
  });
}

export function useRolesSelect(enabled = true) {
  return useQuery({
    queryKey: selectKeys.roles,
    queryFn: selectApi.roles,
    staleTime: STALE_TIME,
    enabled,
  });
}

export function useDivisionsSelect(enabled = true) {
  return useQuery({
    queryKey: selectKeys.divisions,
    queryFn: selectApi.divisions,
    staleTime: STALE_TIME,
    enabled,
  });
}

export function useUsersSelect(enabled = true) {
  return useQuery({
    queryKey: selectKeys.users,
    queryFn: selectApi.users,
    staleTime: STALE_TIME,
    enabled,
  });
}

export function useUsersActiveSelect(enabled = true) {
  return useQuery({
    queryKey: selectKeys.usersActive,
    queryFn: selectApi.usersActive,
    staleTime: STALE_TIME,
    enabled,
  });
}
