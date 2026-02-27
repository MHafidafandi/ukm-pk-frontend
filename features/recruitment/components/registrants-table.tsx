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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
import { Registrant } from "@/features/recruitment/services/recruitmentService";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  registrants: Registrant[];
  onUpdateStatus: (
    registrant: Registrant,
    status: Registrant["status"],
  ) => void;
  onViewDetails?: (registrant: Registrant) => void;
};

const statusConfig: Record<
  string,
  {
    label: string;
    colorClass: string;
  }
> = {
  pending: {
    label: "Menunggu",
    colorClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  interview: {
    label: "Wawancara",
    colorClass:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  accepted: {
    label: "Diterima",
    colorClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Ditolak",
    colorClass:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export const RegistrantsTable = ({
  registrants,
  onUpdateStatus,
  onViewDetails,
}: Props) => {
  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-6">
      <Table>
        <TableHeader className="bg-muted/50 border-b-0">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground h-11 pl-4">
              Nama
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Email/Kontak
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Tanggal Daftar
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Status
            </TableHead>
            <TableHead className="w-[70px] h-11 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrants.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-muted-foreground font-medium"
              >
                Belum ada pendaftar.
              </TableCell>
            </TableRow>
          ) : (
            registrants.map((item) => {
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
                        {item.user?.nama}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {item.user?.username}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {item.user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.user?.nomor_telepon || "-"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">
                    {format(
                      new Date(item.created_at || new Date()),
                      "dd MMM yyyy HH:mm",
                      {
                        locale: idLocale,
                      },
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${status.colorClass}`}
                    >
                      {status.label}
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
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                          Aksi
                        </DropdownMenuLabel>
                        {item.status !== "accepted" && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onUpdateStatus(item, "accepted")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                            Terima
                          </DropdownMenuItem>
                        )}

                        {item.status !== "interview" && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onUpdateStatus(item, "interview")}
                          >
                            <Clock className="mr-2 h-4 w-4 text-amber-600" />
                            Panggil Wawancara
                          </DropdownMenuItem>
                        )}

                        {item.status !== "rejected" && (
                          <DropdownMenuItem
                            className="cursor-pointer focus:text-destructive focus:bg-destructive/10"
                            onClick={() => onUpdateStatus(item, "rejected")}
                          >
                            <XCircle className="mr-2 h-4 w-4 text-destructive" />
                            Tolak
                          </DropdownMenuItem>
                        )}
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
