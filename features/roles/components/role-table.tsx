import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Role } from "@/features/roles/services/roleService";

type Props = {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
};

export const RolesTable = ({ roles, onEdit, onDelete }: Props) => {
  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-6">
      <Table>
        <TableHeader className="bg-muted/50 border-b-0">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground h-11 pl-4">
              Nama Role
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Pengguna
            </TableHead>
            <TableHead className="w-[70px] h-11 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="h-32 text-center text-muted-foreground font-medium"
              >
                Tidak ada data role.
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow
                key={role.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-semibold text-foreground pl-4">
                  {role.name}
                </TableCell>
                <TableCell className="text-muted-foreground font-medium">
                  {role._count?.users ?? 0} Pengguna
                </TableCell>
                <TableCell className="pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
