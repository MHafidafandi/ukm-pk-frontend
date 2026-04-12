import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  LockOpen,
  Lock,
  Archive,
} from "lucide-react";
import { Recruitment } from "@/features/recruitment/services/recruitmentService";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  recruitments: Recruitment[];
  onEdit: (recruitment: Recruitment) => void;
  onDelete: (recruitment: Recruitment) => void;
  onViewRegistrants: (recruitment: Recruitment) => void;
  onOpen: (recruitment: Recruitment) => void;
  onClose: (recruitment: Recruitment) => void;
  onArchive: (recruitment: Recruitment) => void;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  open: {
    label: "Dibuka",
    className: "bg-primary-fixed text-on-primary-fixed-variant",
  },
  closed: {
    label: "Ditutup",
    className: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  },
  draft: {
    label: "Draft",
    className: "bg-surface-container-high text-on-surface-variant",
  },
};

export const RecruitmentTable = ({
  recruitments,
  onEdit,
  onDelete,
  onViewRegistrants,
  onOpen,
  onClose,
  onArchive,
}: Props) => {
  return (
    <div className="overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-high">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
              Judul
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
              Periode
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
              Status
            </th>
            <th className="px-6 py-4 w-16" />
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {recruitments.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-center text-sm text-on-surface-variant"
              >
                Tidak ada data rekrutmen.
              </td>
            </tr>
          ) : (
            recruitments.map((item) => {
              const status = statusConfig[item.status] ?? {
                label: item.status,
                className: "bg-surface-container text-on-surface-variant",
              };
              return (
                <tr
                  key={item.id}
                  className="group hover:bg-surface transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm text-on-surface">
                      {item.nama_recruitment}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5 max-w-xs truncate">
                      {item.deskripsi}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {format(new Date(item.tanggal_buka), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                    {" – "}
                    {format(new Date(item.tanggal_tutup), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.className}`}
                    >
                      {status.label}
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
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onViewRegistrants(item)}
                        >
                          <Users className="mr-2 h-4 w-4 text-primary" />
                          Lihat Pendaftar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {item.status === "draft" && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onOpen(item)}
                          >
                            <LockOpen className="mr-2 h-4 w-4 text-on-primary-fixed-variant" />
                            Buka Pendaftaran
                          </DropdownMenuItem>
                        )}
                        {item.status === "open" && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onClose(item)}
                          >
                            <Lock className="mr-2 h-4 w-4 text-on-tertiary-fixed-variant" />
                            Tutup Pendaftaran
                          </DropdownMenuItem>
                        )}
                        {(item.status === "closed" ||
                          item.status === "draft") && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onArchive(item)}
                          >
                            <Archive className="mr-2 h-4 w-4 text-on-surface-variant" />
                            Arsipkan
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="mr-2 h-4 w-4 text-primary" />
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
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
