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
import { Recruitment } from "@/features/recruitment/services/recruitmentService";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  recruitments: Recruitment[];
  onEdit: (recruitment: Recruitment) => void;
  onDelete: (recruitment: Recruitment) => void;
  onViewRegistrants: (recruitment: Recruitment) => void;
};

const statusConfig: Record<string, { label: string; colorClass: string }> = {
  open: {
    label: "Dibuka",
    colorClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  closed: {
    label: "Ditutup",
    colorClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  draft: {
    label: "Draft",
    colorClass:
      "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  },
};

export const RecruitmentTable = ({
  recruitments,
  onEdit,
  onDelete,
  onViewRegistrants,
}: Props) => {
  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-6">
      <Table>
        <TableHeader className="bg-muted/50 border-b-0">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground h-11 pl-4">
              Judul
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Periode
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Status
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Pendaftar
            </TableHead>
            <TableHead className="w-[70px] h-11 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {recruitments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-muted-foreground font-medium"
              >
                Tidak ada data rekrutmen.
              </TableCell>
            </TableRow>
          ) : (
            recruitments.map((item) => {
              const status = statusConfig[item.status] || {
                label: item.status,
                colorClass: "bg-gray-100 text-gray-800 border-gray-200",
              };
              return (
                <TableRow
                  key={item.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="pl-4">
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5 max-w-[200px] truncate">
                        {item.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">
                    {format(new Date(item.start_date), "dd MMM yyyy", {
                      locale: idLocale,
                    })}{" "}
                    -{" "}
                    {format(new Date(item.end_date), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${status.colorClass}`}
                    >
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {item._count?.registrants ?? 0} Orang
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
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onViewRegistrants(item)}
                        >
                          <Users className="mr-2 h-4 w-4 text-primary" />
                          Lihat Pendaftar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                          onClick={() => onDelete(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
