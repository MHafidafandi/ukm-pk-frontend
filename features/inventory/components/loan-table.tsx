"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loan, LoanStatus } from "../types";
import { Button } from "@/components/ui/button";

type Props = {
  loans: Loan[];
};

const statusColor: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  dipinjam: "secondary", // warning/active
  dikembalikan: "default", // success
  hilang: "destructive",
  rusak: "destructive",
  terlambat: "destructive",
};

export const LoanTable = ({ loans }: Props) => {
  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aset</TableHead>
            <TableHead>Peminjam</TableHead>
            <TableHead>Tgl Pinjam</TableHead>
            <TableHead>Tgl Kembali</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Belum ada data peminjaman.
              </TableCell>
            </TableRow>
          ) : (
            loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">
                  {loan.asset?.nama}
                  <div className="text-xs text-muted-foreground">
                    {loan.asset?.kode}
                  </div>
                </TableCell>
                <TableCell>
                  {loan.user?.username || "Unknown"}
                  {/* Note: User type might differ slightly, adjusted based on sipeduli types */}
                </TableCell>
                <TableCell>{formatDate(loan.tanggal_pinjam)}</TableCell>
                <TableCell>{formatDate(loan.tanggal_kembali)}</TableCell>
                <TableCell>
                  <Badge variant={statusColor[loan.status] || "outline"}>
                    {loan.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {loan.status === "dipinjam" && (
                    <Button size="sm" variant="outline">
                      Kembalikan
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
