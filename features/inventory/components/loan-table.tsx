"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loan } from "../services/assetService";
import { Button } from "@/components/ui/button";

type Props = {
  loans: Loan[];
};

const statusColor: Record<string, { label: string; colorClass: string }> = {
  dipinjam: {
    label: "Dipinjam",
    colorClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  dikembalikan: {
    label: "Dikembalikan",
    colorClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  hilang: {
    label: "Hilang",
    colorClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  rusak: {
    label: "Rusak",
    colorClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  terlambat: {
    label: "Terlambat",
    colorClass:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export const LoanTable = ({ loans }: Props) => {
  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-muted/50 rounded-t-xl border-b-0">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground rounded-tl-xl h-11">
              Aset
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Peminjam
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Tgl Pinjam
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Tgl Kembali
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Status
            </TableHead>
            <TableHead className="w-[120px] rounded-tr-xl h-11 text-right">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-32 text-center text-muted-foreground font-medium"
              >
                Belum ada data peminjaman.
              </TableCell>
            </TableRow>
          ) : (
            loans.map((loan) => {
              const status = statusColor[loan.status] || {
                label: loan.status,
                colorClass: "bg-gray-100 text-gray-800 border-gray-200",
              };
              return (
                <TableRow
                  key={loan.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="font-semibold text-foreground">
                      {loan.asset?.nama}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-0.5">
                      {loan.asset?.kode}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {loan.user?.username || "Unknown"}
                    {/* Note: User type might differ slightly, adjusted based on sipeduli types */}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatDate(loan.tanggal_pinjam)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatDate(loan.tanggal_kembali)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${status.colorClass}`}
                    >
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {loan.status === "dipinjam" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 hover:bg-muted font-medium"
                      >
                        Kembalikan
                      </Button>
                    )}
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
