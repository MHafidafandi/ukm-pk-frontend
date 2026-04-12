"use client";

import { Loan } from "../services/assetService";
import { Loader2, RotateCcw, AlertOctagon } from "lucide-react";
import { useState } from "react";

type Props = {
  loans: Loan[];
  onReturn?: (loanId: string, data: any) => Promise<void>;
  onMarkLost?: (loanId: string, data: any) => Promise<void>;
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> =
  {
    dipinjam: {
      label: "Dipinjam",
      bg: "bg-primary-fixed",
      text: "text-on-primary-fixed-variant",
    },
    dikembalikan: {
      label: "Dikembalikan",
      bg: "bg-secondary-fixed",
      text: "text-on-secondary-fixed-variant",
    },
    hilang: {
      label: "Hilang",
      bg: "bg-error-container",
      text: "text-on-error-container",
    },
    rusak: {
      label: "Rusak",
      bg: "bg-tertiary-fixed",
      text: "text-on-tertiary-fixed-variant",
    },
    terlambat: {
      label: "Terlambat",
      bg: "bg-error-container",
      text: "text-on-error-container",
    },
  };

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_MAP[status] ?? {
    label: status,
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ── Component ─────────────────────────────────────────────────────────────────
export const LoanTable = ({ loans, onReturn, onMarkLost }: Props) => {
  const [returningId, setReturningId] = useState<string | null>(null);
  const [markingLostId, setMarkingLostId] = useState<string | null>(null);

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
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        {/* Header */}
        <thead>
          <tr className="bg-surface-container-high">
            {[
              "Aset",
              "Peminjam",
              "Tgl Pinjam",
              "Tgl Kembali",
              "Status",
              "Aksi",
            ].map((h) => (
              <th
                key={h}
                className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-outline-variant/10">
          {loans.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="h-32 text-center text-on-surface-variant text-sm py-12"
              >
                Belum ada data peminjaman.
              </td>
            </tr>
          ) : (
            loans.map((loan) => {
              const isReturning = returningId === loan.id;
              const isMarkingLost = markingLostId === loan.id;
              const isBusy = isReturning || isMarkingLost;
              const isActive = loan.status === "dipinjam";

              return (
                <tr
                  key={loan.id}
                  className="hover:bg-surface transition-colors"
                >
                  {/* Aset */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-on-surface text-sm">
                      {loan.asset?.nama || "—"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {loan.asset?.kode || ""}
                    </p>
                  </td>

                  {/* Peminjam */}
                  <td className="px-6 py-4 text-sm text-on-surface font-medium">
                    {loan.user?.nama || "—"}
                  </td>

                  {/* Tgl Pinjam */}
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {formatDate(loan.tanggal_pinjam)}
                  </td>

                  {/* Tgl Kembali */}
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {formatDate(loan.tanggal_kembali)}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={loan.status} />
                  </td>

                  {/* Aksi */}
                  <td className="px-6 py-4">
                    {isActive && (
                      <div className="flex items-center gap-2">
                        {onReturn && (
                          <button
                            disabled={isBusy}
                            onClick={() =>
                              handleReturn(loan.id, {
                                asset_id: loan.asset_id,
                                tanggal_kembali: new Date()
                                  .toISOString()
                                  .split("T")[0],
                                kondisi: "baik",
                                catatan: "Dikembalikan dalam kondisi baik",
                              })
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {isReturning ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                            Kembalikan
                          </button>
                        )}
                        {onMarkLost && (
                          <button
                            disabled={isBusy}
                            onClick={() =>
                              handleMarkLost(loan.id, {
                                asset_id: loan.asset_id,
                                catatan: "Ditandai hilang",
                              })
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-error-container text-on-error-container text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {isMarkingLost ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <AlertOctagon className="w-3 h-3" />
                            )}
                            Hilang
                          </button>
                        )}
                      </div>
                    )}
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
