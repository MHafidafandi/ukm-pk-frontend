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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Registrant } from "../api/get-registrants";
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
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  pending: { label: "Menunggu", variant: "outline" },
  interview: { label: "Wawancara", variant: "secondary" },
  accepted: { label: "Diterima", variant: "default" },
  rejected: { label: "Ditolak", variant: "destructive" },
};

export const RegistrantsTable = ({
  registrants,
  onUpdateStatus,
  onViewDetails,
}: Props) => {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email/Kontak</TableHead>
            <TableHead>Tanggal Daftar</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrants.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Belum ada pendaftar.
              </TableCell>
            </TableRow>
          ) : (
            registrants.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{item.user.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.user.username}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{item.user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.user.nomor_telepon || "-"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(item.created_at), "dd MMM yyyy HH:mm", {
                    locale: idLocale,
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statusConfig[item.status]?.variant || ("outline" as any)
                    }
                  >
                    {statusConfig[item.status]?.label || item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      {item.status !== "accepted" && (
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(item, "accepted")}
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Terima
                        </DropdownMenuItem>
                      )}

                      {item.status !== "interview" && (
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(item, "interview")}
                        >
                          <Clock className="mr-2 h-4 w-4 text-orange-600" />
                          Panggil Wawancara
                        </DropdownMenuItem>
                      )}

                      {item.status !== "rejected" && (
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(item, "rejected")}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Tolak
                        </DropdownMenuItem>
                      )}

                      {/*
                      <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={() => onViewDetails && onViewDetails(item)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Detail & CV
                      </DropdownMenuItem> 
                      */}
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
