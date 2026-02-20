import { useAuth } from "@/contexts/AuthContext";
import { Permission } from "@/lib/permissions";

export function usePermission() {
  const { user } = useAuth();

  // Ambil permission langsung dari user object, bukan dari role mapping
  const userPermissions = user?.permissions || [];

  /**
   * Cek apakah user punya permission tertentu.
   */
  function can(permission: Permission): boolean {
    return userPermissions.includes(permission as string);
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

  return {
    can,
    canAll,
    canAny,
    userPermissions,
  };
}
