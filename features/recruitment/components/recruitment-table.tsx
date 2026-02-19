import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { Recruitment } from "../api/get-recruitments";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  recruitments: Recruitment[];
  onEdit: (recruitment: Recruitment) => void;
  onDelete: (recruitment: Recruitment) => void;
  onViewRegistrants: (recruitment: Recruitment) => void;
};

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  open: { label: "Dibuka", variant: "default" },
  closed: { label: "Ditutup", variant: "secondary" },
  draft: { label: "Draft", variant: "outline" },
};

export const RecruitmentTable = ({
  recruitments,
  onEdit,
  onDelete,
  onViewRegistrants,
}: Props) => {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Periode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pendaftar</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {recruitments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada data rekrutmen.
              </TableCell>
            </TableRow>
          ) : (
            recruitments.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {item.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(item.start_date), "dd MMM yyyy", {
                    locale: idLocale,
                  })}{" "}
                  -{" "}
                  {format(new Date(item.end_date), "dd MMM yyyy", {
                    locale: idLocale,
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusConfig[item.status]?.variant || "outline"}
                  >
                    {statusConfig[item.status]?.label || item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item._count?.registrants ?? 0} Orang</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewRegistrants(item)}>
                        <Users className="mr-2 h-4 w-4" />
                        Lihat Pendaftar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(item)}
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
