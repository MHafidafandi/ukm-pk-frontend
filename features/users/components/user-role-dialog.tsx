import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { User } from "@/features/auth/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { useUserContext } from "@/features/users/contexts/UserContext";
import { useRolesSelect } from "@/lib/services/selectService";
import { Role } from "@/features/roles/services/roleService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
};

export const UserRoleDialog = ({ open, onOpenChange, user }: Props) => {
  const { data: roles = [], isLoading: loadingRoles } = useRolesSelect(open);
  const [selectedRole, setSelectedRole] = useState("");
  const {
    assignUserRole: assignRole,
    removeUserRole: removeRole,
    isAssigningRole,
  } = useUserContext();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentRoles: any[] = Array.isArray(user?.roles) ? user!.roles : [];
  const availableRoles = (roles as Role[]).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (role) => !currentRoles.some((ur: any) => ur.id === role.id),
  );

  const handleAssign = async () => {
    if (!user || !selectedRole) return;
    try {
      await assignRole({ id: user.id, roleId: selectedRole });
      toast.success("Role berhasil ditambahkan");
      setSelectedRole("");
    } catch {
      toast.error("Gagal menambahkan role");
    }
  };

  const handleRemove = async (roleId: string) => {
    if (!user) return;
    try {
      await removeRole({ id: user.id, roleId });
      toast.success("Role berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus role");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest p-0">
        <div className="px-8 pt-8 pb-6 bg-surface-container-low">
          <DialogHeader>
            <DialogTitle className="font-['Manrope'] text-xl font-bold text-primary">
              Kelola Role
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              Atur role untuk{" "}
              <strong className="text-on-surface">{user?.nama}</strong>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Current Roles */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Role Saat Ini
            </Label>
            <div className="flex flex-wrap gap-2">
              {currentRoles.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  User belum memiliki role.
                </p>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                currentRoles.map((role: any) => (
                  <span
                    key={role.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full font-interface"
                  >
                    {role.name}
                    <button
                      onClick={() => handleRemove(role.id)}
                      className="rounded-full p-0.5 hover:bg-destructive hover:text-white transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Add Role */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Tambah Role
            </Label>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="border-0 border-b-2 border-outline-variant rounded-none px-0 focus:border-primary focus:ring-0 bg-transparent">
                    <SelectValue
                      placeholder={loadingRoles ? "Memuat..." : "Pilih role..."}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.length === 0 ? (
                      <SelectItem
                        value="none"
                        disabled
                        className="font-interface"
                      >
                        Tidak ada role tersedia
                      </SelectItem>
                    ) : (
                      availableRoles.map((role: Role) => (
                        <SelectItem
                          key={role.id}
                          value={role.id}
                          className="font-interface"
                        >
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={handleAssign}
                disabled={!selectedRole || isAssigningRole}
                className="font-bold px-4 py-2 text-sm text-on-primary bg-primary rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-surface-container-low flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2.5 text-sm font-medium text-primary border border-outline/20 rounded-xl hover:bg-surface-container transition-colors"
          >
            Selesai
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
