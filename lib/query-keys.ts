/**
 * Query Key Factory Pattern
 * Digunakan untuk standar query keys `react-query` di seluruh fitur
 */
export const queryKeys = {
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: Record<string, string | number>) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    stats: () => [...queryKeys.users.all, "stats"] as const,
  },
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.roles.lists(), { filters }] as const,
    details: () => [...queryKeys.roles.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },
  divisions: {
    all: ["divisions"] as const,
    lists: () => [...queryKeys.divisions.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.divisions.lists(), { filters }] as const,
    details: () => [...queryKeys.divisions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.divisions.details(), id] as const,
  },
  activities: {
    all: ["activities"] as const,
    lists: () => [...queryKeys.activities.all, "list"] as const,
    list: (filters: Record<string, string | number>) =>
      [...queryKeys.activities.lists(), { filters }] as const,
    details: () => [...queryKeys.activities.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.activities.details(), id] as const,
  },
  assets: {
    all: ["assets"] as const,
    lists: () => [...queryKeys.assets.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.assets.lists(), { filters }] as const,
    details: () => [...queryKeys.assets.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.assets.details(), id] as const,
  },
  donations: {
    all: ["donations"] as const,
    lists: () => [...queryKeys.donations.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.donations.lists(), { filters }] as const,
    details: () => [...queryKeys.donations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.donations.details(), id] as const,
    stats: () => [...queryKeys.donations.all, "stats"] as const,
  },
  documentations: {
    all: ["documentations"] as const,
    byActivity: (activityId: string) =>
      [...queryKeys.documentations.all, "activity", activityId] as const,
  },
  recruitments: {
    all: ["recruitments"] as const,
    lists: () => [...queryKeys.recruitments.all, "list"] as const,
    list: (filters: string) =>
      [...queryKeys.recruitments.lists(), { filters }] as const,
    details: () => [...queryKeys.recruitments.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.recruitments.details(), id] as const,
  },
};
