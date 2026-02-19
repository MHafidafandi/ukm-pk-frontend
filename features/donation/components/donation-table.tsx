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
import { Donation, DonationStatus } from "../types";
import { PermissionGate } from "@/components/guard";
import { Badge } from "@/components/ui/badge";

type Props = {
  donations: Donation[];
  onEdit: (donation: Donation) => void;
  onDelete: (donation: Donation) => void;
};

const statusMap: Record<DonationStatus, string> = {
  pending: "Menunggu",
  verified: "Terverifikasi",
  rejected: "Ditolak",
  canceled: "Dibatalkan",
};

const statusColorMap: Record<
  DonationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  verified: "default", // or success if available
  rejected: "destructive",
  canceled: "outline",
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donatur</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Metode</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Belum ada data donasi.
              </TableCell>
            </TableRow>
          ) : (
            donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell className="font-medium">
                  {donation.nama_donatur}
                  {donation.deskripsi && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {donation.deskripsi}
                    </p>
                  )}
                </TableCell>
                <TableCell>{formatRupiah(donation.jumlah)}</TableCell>
                <TableCell className="capitalize">
                  {donation.metode.replace("_", " ")}
                </TableCell>
                <TableCell>{formatDate(donation.tanggal)}</TableCell>
                <TableCell>
                  <Badge variant={statusColorMap[donation.status]}>
                    {statusMap[donation.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <PermissionGate
                        permission="donations:update"
                        role={["administrator", "super_admin"]}
                      >
                        <DropdownMenuItem onClick={() => onEdit(donation)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </PermissionGate>
                      <PermissionGate
                        permission="donations:delete"
                        role={["administrator", "super_admin"]}
                      >
                        <DropdownMenuItem
                          className="text-destructive"
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
