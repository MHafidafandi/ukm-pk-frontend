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
import { Division } from "@/features/divisions/services/divisionService";
import { PermissionGate } from "@/components/guard";

type Props = {
  divisions: Division[];
  onEdit: (division: Division) => void;
  onDelete: (division: Division) => void;
};

export const DivisionsTable = ({ divisions, onEdit, onDelete }: Props) => {
  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-6">
      <Table>
        <TableHeader className="bg-muted/50 border-b-0">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground h-11 pl-4">
              Nama Divisi
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Deskripsi
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Anggota
            </TableHead>
            <TableHead className="w-[70px] h-11 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {divisions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-32 text-center text-muted-foreground font-medium"
              >
                Tidak ada data divisi.
              </TableCell>
            </TableRow>
          ) : (
            divisions.map((division) => (
              <TableRow
                key={division.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-semibold text-foreground pl-4">
                  {division.nama_divisi}
                </TableCell>
                <TableCell className="text-muted-foreground font-medium">
                  {division.deskripsi || "-"}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {division._count?.users ?? 0} Anggota
                  </span>
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
                      <PermissionGate permission={"divisions:update" as any}>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onEdit(division)}
                        >
                          <Pencil className="mr-2 h-4 w-4 text-primary" />
                          Edit
                        </DropdownMenuItem>
                      </PermissionGate>
                      <PermissionGate permission={"divisions:delete" as any}>
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                          onClick={() => onDelete(division)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </PermissionGate>
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
