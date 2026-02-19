/**
 * usePermission — hook untuk RBAC (Role-Based Access Control)
 *
 * Role matrix:
 * - super_admin   : hanya bisa manage hak akses user (roles assignment)
 * - administrator : bisa semua KECUALI manage hak akses
 * - member        : read-only (GET saja, tidak bisa create/update/delete)
 */
import { useAuth, UserRole } from "@/contexts/AuthContext";

// ── Permission keys ────────────────────────────────────────────────────────

export type Permission =
  // Users
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "users:manage_status" // activate / deactivate / alumni
  // Roles & hak akses
  | "roles:read"
  | "roles:assign" // assign/remove role ke user — HANYA super_admin
  | "roles:manage" // create/update/delete role — HANYA super_admin
  // Divisions
  | "divisions:read"
  | "divisions:create"
  | "divisions:update"
  | "divisions:delete"
  | "divisions:assign_user" // assign user ke divisi
  // Recruitment
  | "recruitment:read"
  | "recruitment:create"
  | "recruitment:update"
  | "recruitment:delete"
  | "recruitment:manage_registrants"
  // Activities
  | "activities:read"
  | "activities:create"
  | "activities:update"
  | "activities:delete"
  | "activities:manage_reports"
  // Donations
  | "donations:read"
  | "donations:create"
  | "donations:update"
  | "donations:delete";

// ── Permission matrix ──────────────────────────────────────────────────────

const PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // super_admin HANYA bisa manage hak akses (roles)
    "roles:read",
    "roles:assign",
    "roles:manage",
    // Bisa read semua untuk navigasi
    "users:read",
    "divisions:read",
    "recruitment:read",
    "activities:read",
    "donations:read",
    // TIDAK BISA manage user profile, recruitments, activities, donations
  ],

  administrator: [
    // Users — semua kecuali assign role
    // Administrator BISA manage users (create/edit/delete/status)
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "users:manage_status",
    "divisions:assign_user",
    // Roles — hanya read (tidak bisa assign/manage)
    "roles:read",
    // Divisions — semua
    "divisions:read",
    "divisions:create",
    "divisions:update",
    "divisions:delete",
    // Recruitment — semua
    "recruitment:read",
    "recruitment:create",
    "recruitment:update",
    "recruitment:delete",
    "recruitment:manage_registrants",
    // Activities — semua
    "activities:read",
    "activities:create",
    "activities:update",
    "activities:delete",
    "activities:manage_reports",
    // Donations
    "donations:read",
    "donations:create",
    "donations:update",
    "donations:delete",
  ],

  member: [
    // Member hanya bisa read
    "users:read",
    "roles:read",
    "divisions:read",
    "recruitment:read",
    "activities:read",
  ],
};

// ── Hook ───────────────────────────────────────────────────────────────────

export function usePermission() {
  const { user } = useAuth();

  const roles: UserRole[] = user?.roles ?? [];

  /**
   * Cek apakah user punya permission tertentu.
   * Jika user punya lebih dari satu role, cukup salah satu yang punya permission.
   */
  function can(permission: Permission): boolean {
    return roles.some(
      (role) => PERMISSIONS[role]?.includes(permission) ?? false,
    );
  }

  /**
   * Cek apakah user punya SEMUA permission yang diberikan.
   */
  function canAll(...permissions: Permission[]): boolean {
    return permissions.every((p) => can(p));
  }

  /**
   * Cek apakah user punya SALAH SATU dari permission yang diberikan.
   */
  function canAny(...permissions: Permission[]): boolean {
    return permissions.some((p) => can(p));
  }

  /** Shorthand role checks */
  const isSuperAdmin = roles.includes("super_admin");
  const isAdministrator = roles.includes("administrator");
  const isMember = roles.includes("member");
  const isAdmin = isSuperAdmin || isAdministrator; // untuk backward compat

  return {
    can,
    canAll,
    canAny,
    isSuperAdmin,
    isAdministrator,
    isMember,
    isAdmin,
    roles,
  };
}
