"use client";

import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { UsersList } from "@/features/users/components/users-list";
import { UserProvider } from "@/features/users/contexts/UserContext";
import { RoleProvider } from "@/features/roles/contexts/RoleContext";
import { DivisionProvider } from "@/features/divisions/contexts/DivisionContext";

export default function UsersPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.VIEW_USERS}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
          <UserProvider>
            <RoleProvider>
              <DivisionProvider>
                <UsersList />
              </DivisionProvider>
            </RoleProvider>
          </UserProvider>
        </div>
      </div>
    </PermissionGuard>
  );
}
