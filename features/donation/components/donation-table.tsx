import { Donation, DonationStatus } from "../services/donationService";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { env } from "@/configs/env";
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  Pencil,
  Trash2,
  Image,
  Landmark,
  Banknote,
  Wallet,
  QrCode,
  HelpCircle,
  Inbox,
} from "lucide-react";

type Props = {
  donations: Donation[];
  onEdit: (donation: Donation) => void;
  onDelete: (donation: Donation) => void;
  onVerify: (donation: Donation, catatan?: string) => void;
  onReject: (donation: Donation, catatan: string) => void;
  onCancel: (donation: Donation) => void;
};

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig: Record<
  DonationStatus,
  { label: string; pill: string; dot: string }
> = {
  pending: {
    label: "Pending",
    pill: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    dot: "bg-tertiary",
  },
  verified: {
    label: "Verified",
    pill: "bg-primary-fixed text-on-primary-fixed-variant",
    dot: "bg-primary",
  },
  rejected: {
    label: "Ditolak",
    pill: "bg-error-container text-on-error-container",
    dot: "bg-error",
  },
  canceled: {
    label: "Dibatalkan",
    pill: "bg-surface-container-highest text-on-surface-variant",
    dot: "bg-outline",
  },
};

// ─── Method Config ────────────────────────────────────────────────────────────
const normalizeMethod = (method: string): string => {
  const map: Record<string, string> = {
    "Transfer Bank": "bank_transfer",
    Tunai: "cash",
    "E-Wallet": "e_wallet",
    QRIS: "qris",
  };
  return map[method] ?? method;
};

const MethodIcon = ({ method }: { method: string }) => {
  const key = normalizeMethod(method);
  const cls = "w-4 h-4 text-outline";
  switch (key) {
    case "bank_transfer":
      return <Landmark className={cls} />;
    case "cash":
      return <Banknote className={cls} />;
    case "e_wallet":
      return <Wallet className={cls} />;
    case "qris":
      return <QrCode className={cls} />;
    default:
      return <HelpCircle className={cls} />;
  }
};

const methodLabel: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  cash: "Tunai (Cash)",
  e_wallet: "E-Wallet",
  qris: "QRIS",
  other: "Lainnya",
};

// ─── Avatar Helpers ───────────────────────────────────────────────────────────
const AVATAR_PALETTES = [
  "bg-primary-fixed text-on-primary-fixed",
  "bg-secondary-fixed text-on-secondary-fixed",
  "bg-tertiary-fixed text-on-tertiary-fixed",
  "bg-surface-container-highest text-on-surface",
  "bg-primary-fixed-dim text-on-primary-fixed",
];

const getAvatarPalette = (name: string) =>
  AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];

const getInitials = (name: string) => {
  const lower = name.toLowerCase();
  if (lower === "hamba allah" || lower === "anonymous") return "AN";
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

// ─── Component ────────────────────────────────────────────────────────────────
export const DonationTable = ({
  donations,
  onEdit,
  onDelete,
  onVerify,
  onReject,
  onCancel,
}: Props) => {
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[800px]">
        {/* Header */}
        <thead>
          <tr className="bg-surface-container-high">
            <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Donatur
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">
              Jumlah
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Metode
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Tanggal
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Status
            </th>
            <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">
              Aksi
            </th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="text-sm divide-y divide-outline-variant/10">
          {donations.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-8 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Inbox className="w-10 h-10 text-on-surface-variant opacity-40" />
                  <p className="text-on-surface-variant font-medium">
                    Belum ada data donasi
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            donations.map((donation) => {
              const status =
                statusConfig[donation.status] ?? statusConfig.canceled;
              const methodKey = normalizeMethod(donation.metode);
              const label = methodLabel[methodKey] ?? "Lainnya";
              const proofUrl = donation.bukti_pembayaran ?? "";
              const isAnonymous =
                donation.nama_donatur.toLowerCase().includes("hamba allah") ||
                donation.nama_donatur.toLowerCase() === "anonymous";
              const dateInfo = formatDate(donation.tanggal);

              return (
                <tr
                  key={donation.id}
                  className="hover:bg-surface transition-colors group"
                >
                  {/* Donatur */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                          isAnonymous
                            ? "bg-surface-container-highest text-on-surface-variant"
                            : getAvatarPalette(donation.nama_donatur)
                        }`}
                      >
                        {getInitials(donation.nama_donatur)}
                      </div>
                      <div className="truncate max-w-[200px]">
                        <p className="font-semibold text-on-surface truncate">
                          {isAnonymous ? "Anonymous" : donation.nama_donatur}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">
                          {donation.deskripsi || "Donasi Umum"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Jumlah */}
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <span className="font-['Manrope'] font-bold text-on-surface">
                      {formatRupiah(donation.jumlah)}
                    </span>
                  </td>

                  {/* Metode */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <MethodIcon method={donation.metode} />
                      <span>{label}</span>
                    </div>
                  </td>

                  {/* Tanggal */}
                  <td className="px-6 py-5 whitespace-nowrap text-on-surface-variant">
                    <p>{dateInfo.date}</p>
                    <p className="text-xs text-outline mt-0.5">
                      {dateInfo.time}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.pill}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* View Proof */}
                      <PermissionGate permission={PERMISSIONS.VIEW_DONATIONS}>
                        {proofUrl !== "" && (
                          <button
                            title="Lihat Bukti Pembayaran"
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                            onClick={() =>
                              window.open(
                                proofUrl.startsWith("http")
                                  ? proofUrl
                                  : `${env.MEDIA_URL}${proofUrl}`,
                                "_blank",
                              )
                            }
                          >
                            <Image className="w-4 h-4" />
                          </button>
                        )}
                      </PermissionGate>

                      {/* Verify / Reject / Cancel */}
                      <PermissionGate permission={PERMISSIONS.VERIFY_DONATIONS}>
                        {donation.status === "pending" && (
                          <>
                            <button
                              title="Verifikasi"
                              className="p-1.5 rounded-lg text-primary hover:bg-primary-fixed transition-colors"
                              onClick={() => onVerify(donation)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              title="Tolak"
                              className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors"
                              onClick={() => {
                                const catatan =
                                  window.prompt("Catatan penolakan:");
                                if (catatan?.trim())
                                  onReject(donation, catatan.trim());
                              }}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              title="Batalkan"
                              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                              onClick={() => onCancel(donation)}
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </PermissionGate>

                      {/* Edit */}
                      <PermissionGate permission={PERMISSIONS.EDIT_DONATIONS}>
                        <button
                          title="Edit"
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          onClick={() => onEdit(donation)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </PermissionGate>

                      {/* Delete */}
                      <PermissionGate permission={PERMISSIONS.DELETE_DONATIONS}>
                        {donation.status !== "verified" && (
                          <button
                            title="Hapus"
                            className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors"
                            onClick={() => onDelete(donation)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </PermissionGate>
                    </div>
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
