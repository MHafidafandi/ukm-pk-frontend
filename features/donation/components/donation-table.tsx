"use client";

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
import { Donation, DonationStatus } from "../services/donationService";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

type Props = {
  donations: Donation[];
  onEdit: (donation: Donation) => void;
  onDelete: (donation: Donation) => void;
};

const statusColorMap: Record<
  DonationStatus,
  { label: string; colorClass: string }
> = {
  pending: {
    label: "Menunggu",
    colorClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  verified: {
    label: "Terverifikasi",
    colorClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Ditolak",
    colorClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  canceled: {
    label: "Dibatalkan",
    colorClass:
      "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  },
};

export const DonationTable = ({ donations, onEdit, onDelete }: Props) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-muted/50 rounded-t-xl border-b-0">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground rounded-tl-xl h-11">
              Donatur
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Jumlah
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Metode
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Tanggal
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Status
            </TableHead>
            <TableHead className="w-[70px] rounded-tr-xl h-11"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-32 text-center text-muted-foreground font-medium"
              >
                Belum ada data donasi.
              </TableCell>
            </TableRow>
          ) : (
            donations.map((donation) => {
              const status = statusColorMap[donation.status] || {
                label: donation.status,
                colorClass: "bg-gray-100 text-gray-800 border-gray-200",
              };
              return (
                <TableRow
                  key={donation.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="font-semibold">{donation.nama_donatur}</div>
                    {donation.deskripsi && (
                      <p className="text-xs text-muted-foreground font-medium mt-0.5 max-w-[200px] truncate">
                        {donation.deskripsi}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(donation.jumlah)}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground font-medium">
                    {donation.metode.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatDate(donation.tanggal)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${status.colorClass}`}
                    >
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <PermissionGate permission={PERMISSIONS.EDIT_DONATIONS}>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onEdit(donation)}
                          >
                            <Pencil className="mr-2 h-4 w-4 text-primary" />
                            Edit
                          </DropdownMenuItem>
                        </PermissionGate>
                        <PermissionGate
                          permission={PERMISSIONS.DELETE_DONATIONS}
                        >
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                            onClick={() => onDelete(donation)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </PermissionGate>
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
