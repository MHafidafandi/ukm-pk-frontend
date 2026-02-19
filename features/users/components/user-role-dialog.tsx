import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { User } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRoles } from "@/features/roles/api/get-roles";
import { useAssignUserRole, useRemoveUserRole } from "../api/role-assignment";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useUserRoles } from "../api/role-assignment";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
};

export const UserRoleDialog = ({ open, onOpenChange, user }: Props) => {
  const [selectedRole, setSelectedRole] = useState("");

  const rolesQuery = useRoles();
  const userRolesQuery = useUserRoles({ id: user?.id ?? "" });

  const assignRole = useAssignUserRole();
  const removeRole = useRemoveUserRole();

  const roles = rolesQuery.data?.data ?? [];
  // Ensure userRoles is always an array
  const userRolesData = userRolesQuery.data?.data ?? [];
  const currentRoles = Array.isArray(userRolesData) ? userRolesData : [];

  // Filter out roles user already has
  const availableRoles = roles.filter(
    (role) => !currentRoles.some((ur: any) => ur.id === role.id),
  );

  const handleAssign = async () => {
    if (!user || !selectedRole) return;
    try {
      await assignRole.mutateAsync({
        id: user.id,
        roleIds: [selectedRole],
      });
      toast.success("Role berhasil ditambahkan");
      setSelectedRole("");
      userRolesQuery.refetch();
    } catch (error) {
      toast.error("Gagal menambahkan role");
    }
  };

  const handleRemove = async (roleId: string) => {
    if (!user) return;
    try {
      await removeRole.mutateAsync({
        id: user.id,
        roleIds: [roleId],
      });
      toast.success("Role berhasil dihapus");
      userRolesQuery.refetch();
    } catch (error) {
      toast.error("Gagal menghapus role");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kelola Role</DialogTitle>
          <DialogDescription>
            Atur role untuk pengguna <strong>{user?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current Roles */}
          <div className="space-y-2">
            <Label>Role Saat Ini</Label>
            <div className="flex flex-wrap gap-2">
              {userRolesQuery.isLoading ? (
                <Spinner className="h-4 w-4" />
              ) : currentRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  User belum memiliki role.
                </p>
              ) : (
                currentRoles.map((role: any) => (
                  <Badge key={role.id} variant="secondary" className="pr-1">
                    {role.name}
                    <button
                      onClick={() => handleRemove(role.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Add Role */}
          <div className="flex gap-2 items-end">
            <div className="grid w-full gap-2">
              <Label>Tambah Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Tidak ada role tersedia
                    </SelectItem>
                  ) : (
                    availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAssign}
              disabled={!selectedRole || assignRole.isPending}
            >
              Tambah
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
