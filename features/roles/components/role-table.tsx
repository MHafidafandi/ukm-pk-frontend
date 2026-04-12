import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Role } from "@/features/roles/services/roleService";
import { Button } from "@/components/ui/button";

type Props = {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
};

export const RolesTable = ({ roles, onEdit, onDelete }: Props) => {
  return (
    <div className="overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-high">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-interface">
              Nama Role
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-interface">
              Pengguna
            </th>
            <th className="px-6 py-4 w-16" />
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {roles.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-6 py-12 text-center text-sm text-on-surface-variant"
              >
                Tidak ada data role.
              </td>
            </tr>
          ) : (
            roles.map((role) => (
              <tr
                key={role.id}
                className="group hover:bg-surface transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="font-semibold text-sm text-on-surface">
                      {role.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-on-surface-variant">
                    {role.user_count ?? 0} Pengguna
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onEdit(role)}
                      >
                        <Pencil className="mr-2 h-4 w-4 text-primary" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                        onClick={() => onDelete(role)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
