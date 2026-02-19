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
import { Division } from "../api";
import { PermissionGate } from "@/components/guard";

type Props = {
  divisions: Division[];
  onEdit: (division: Division) => void;
  onDelete: (division: Division) => void;
};

export const DivisionsTable = ({ divisions, onEdit, onDelete }: Props) => {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Divisi</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Anggota</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {divisions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada data divisi.
              </TableCell>
            </TableRow>
          ) : (
            divisions.map((division) => (
              <TableRow key={division.id}>
                <TableCell className="font-medium">
                  {division.nama_divisi}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {division.deskripsi || "-"}
                </TableCell>
                <TableCell>{division._count?.users ?? 0} Anggota</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <PermissionGate permission="divisions:update">
                        <DropdownMenuItem onClick={() => onEdit(division)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </PermissionGate>
                      <PermissionGate permission="divisions:delete">
                        <DropdownMenuItem
                          className="text-destructive"
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
