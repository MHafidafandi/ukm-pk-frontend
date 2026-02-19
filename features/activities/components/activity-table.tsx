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
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Activity } from "../api/get-activities";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onViewDetail: (activity: Activity) => void;
};

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  ongoing: { label: "Sedang Berjalan", variant: "default" },
  completed: { label: "Selesai", variant: "secondary" },
  pending: { label: "Persiapan", variant: "outline" },
  cancelled: { label: "Dibatalkan", variant: "outline" }, // using outline for red/destructive usually via className but badge variant is limited
};

export const ActivityTable = ({
  activities,
  onEdit,
  onDelete,
  onViewDetail,
}: Props) => {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada data kegiatan.
              </TableCell>
            </TableRow>
          ) : (
            activities.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{item.judul}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                      {item.deskripsi}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(item.tanggal), "dd MMM yyyy", {
                    locale: idLocale,
                  })}
                </TableCell>
                <TableCell className="text-sm">{item.lokasi}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusConfig[item.status]?.variant || "outline"}
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
                      <DropdownMenuItem onClick={() => onViewDetail(item)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Detail & Progres
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
