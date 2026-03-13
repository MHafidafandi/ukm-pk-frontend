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
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  loans: Loan[];
  onReturn?: (loanId: string, data: any) => Promise<void>;
  onMarkLost?: (loanId: string, data: any) => Promise<void>;
};

const statusColor: Record<string, { label: string; colorClass: string }> = {
  dipinjam: {
    label: "Borrowed",
    colorClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  dikembalikan: {
    label: "Returned",
    colorClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  hilang: {
    label: "Lost",
    colorClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  rusak: {
    label: "Broken",
    colorClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  terlambat: {
    label: "Late",
    colorClass:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export const LoanTable = ({ loans, onReturn, onMarkLost }: Props) => {
  const [returningId, setReturningId] = useState<string | null>(null);

  const [markingLostId, setMarkingLostId] = useState<string | null>(null);

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleReturn = async (loanId: string, data: any) => {
    if (!onReturn) return;
    setReturningId(loanId);
    try {
      await onReturn(loanId, data);
    } finally {
      setReturningId(null);
    }
  };

  const handleMarkLost = async (loanId: string, data: any) => {
    if (!onMarkLost) return;
    setMarkingLostId(loanId);
    try {
      await onMarkLost(loanId, data);
    } finally {
      setMarkingLostId(null);
    }
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-muted/50 rounded-t-xl border-b-0">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground rounded-tl-xl h-11 text-center">
              Assets
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11 text-center">
              Borrower
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11 text-center">
              Loan Date
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11 text-center">
              Return Date
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11 text-center">
              Status
            </TableHead>
            <TableHead className="w-[120px] rounded-tr-xl h-11 text-center">
              Action
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
                No loan data yet.
              </TableCell>
            </TableRow>
          ) : (
            loans.map((loan) => {
              const status = statusColor[loan.status] || {
                label: loan.status,
                colorClass: "bg-gray-100 text-gray-800 border-gray-200",
              };
              const isReturning = returningId === loan.id;

              return (
                <TableRow
                  key={loan.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="font-semibold text-foreground">
                      {loan.asset_id}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {loan.user_id || "Unknown"}
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
                  <TableCell className="text-right flex gap-2 justify-end">
                    {loan.status === "dipinjam" && onReturn && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 hover:bg-muted font-medium"
                        disabled={isReturning || markingLostId === loan.id}
                        onClick={() =>
                          handleReturn(loan.id, {
                            asset_id: loan.asset_id,
                            tanggal_kembali: new Date().toISOString().split("T")[0],
                            kondisi: "baik",
                            catatan: "Returned in good condition",
                          })
                        }
                      >
                        {isReturning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Return"}
                      </Button>
                    )}
                    {loan.status === "dipinjam" && onMarkLost && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 font-medium"
                        disabled={isReturning || markingLostId === loan.id}
                        onClick={() =>
                          handleMarkLost(loan.id, {
                            asset_id: loan.asset_id,
                            catatan: "Marked as lost",
                          })
                        }
                      >
                        {markingLostId === loan.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Mark Lost"}
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