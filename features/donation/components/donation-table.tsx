import { Donation, DonationStatus } from "../services/donationService";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  donations: Donation[];
  onEdit: (donation: Donation) => void;
  onDelete: (donation: Donation) => void;
};

const statusMap: Record<DonationStatus, { label: string; colorClass: string }> =
{
  pending: {
    label: "Pending",
    colorClass:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  verified: {
    label: "Verified",
    colorClass:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  rejected: {
    label: "Rejected",
    colorClass:
      "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
  canceled: {
    label: "Canceled",
    colorClass:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
};

const methodMap: Record<string, { label: string; icon: React.ReactNode }> = {
  bank_transfer: {
    label: "Bank Transfer",
    icon: (
      <svg
        className="w-5 h-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
  },
  qris: {
    label: "QRIS",
    icon: (
      <svg
        className="w-5 h-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="5" height="5" x="3" y="3" rx="1" />
        <rect width="5" height="5" x="16" y="3" rx="1" />
        <rect width="5" height="5" x="3" y="16" rx="1" />
        <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
        <path d="M21 21v.01" />
        <path d="M12 7v3a2 2 0 0 1-2 2H7" />
        <path d="M3 12h.01" />
        <path d="M12 3h.01" />
        <path d="M12 16v.01" />
        <path d="M16 12h1" />
        <path d="M21 12v.01" />
        <path d="M12 21v-1" />
      </svg>
    ),
  },
  e_wallet: {
    label: "E-Wallet",
    icon: (
      <svg
        className="w-5 h-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="M22 10h-4c-1.1 0-2-.9-2-2V4" />
        <path d="M12 11h.01" />
      </svg>
    ),
  },
  cash: {
    label: "Cash",
    icon: (
      <svg
        className="w-5 h-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="8" />
        <line x1="12" x2="12" y1="8" y2="16" />
        <line x1="9" x2="15" y1="12" y2="12" />
      </svg>
    ),
  },
  other: {
    label: "Other",
    icon: (
      <svg
        className="w-5 h-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
};

const getAvatarGradient = (name: string) => {
  const gradients = [
    "from-purple-400 to-blue-500",
    "from-pink-400 to-red-500",
    "from-green-400 to-teal-500",
    "from-orange-400 to-yellow-500",
    "from-indigo-400 to-cyan-500",
  ];
  const charCode = name.charCodeAt(0) || 0;
  return gradients[charCode % gradients.length];
};

const getInitials = (name: string) => {
  if (
    name.toLowerCase() === "hamba allah" ||
    name.toLowerCase() === "anonymous"
  )
    return "AN";
  const parts = name.split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export const DonationTable = ({ donations, onEdit, onDelete }: Props) => {
  // Format DateTime
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
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
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Donatur Name
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Amount (IDR)
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Method
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light dark:divide-border-dark">
          {donations.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-12 text-center text-text-secondary-light dark:text-text-secondary-dark"
              >
                No donations found.
              </td>
            </tr>
          ) : (
            donations.map((donation) => {
              const statusInfo = statusMap[donation.status] || {
                label: donation.status,
                colorClass: "bg-slate-100 text-slate-800",
              };
              const methodInfo = methodMap[donation.metode] || methodMap.other;
              const isAnonymous =
                donation.nama_donatur.toLowerCase().includes("hamba allah") ||
                donation.nama_donatur.toLowerCase() === "anonymous";
              const dateInfo = formatDate(donation.tanggal);

              return (
                <tr
                  key={donation.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${isAnonymous
                          ? "bg-slate-200 dark:bg-slate-700 text-text-secondary-light dark:text-text-secondary-dark"
                          : `bg-gradient-to-tr ${getAvatarGradient(donation.nama_donatur)} text-white`
                          }`}
                      >
                        {getInitials(donation.nama_donatur)}
                      </div>
                      <div className="ml-4 truncate max-w-[200px]">
                        <div
                          className={`text-sm font-medium truncate ${isAnonymous ? "text-text-secondary-light dark:text-text-secondary-dark" : "text-gray-900 dark:text-white"}`}
                        >
                          {isAnonymous ? "Anonymous" : donation.nama_donatur}
                        </div>
                        <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                          {donation.deskripsi || "General Donation"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isAnonymous ? "text-text-secondary-light dark:text-text-secondary-dark" : ""}`}
                  >
                    {formatRupiah(donation.jumlah)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {dateInfo.date}{" "}
                    <span className="text-xs block text-gray-400">
                      {dateInfo.time}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {methodInfo.icon}
                      <span
                        className={`text-sm ${isAnonymous ? "text-text-secondary-light dark:text-text-secondary-dark" : ""}`}
                      >
                        {methodInfo.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.colorClass}`}
                    >
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <PermissionGate permission={PERMISSIONS.VIEW_DONATIONS}>
                        {donation.bukti_pembayaran && (
                          <button
                            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg text-green-600 transition-colors mr-1"
                            title="View Proof"
                            onClick={() => window.open(donation.bukti_pembayaran.startsWith("http") ? donation.bukti_pembayaran : `${process.env.NEXT_PUBLIC_API_URL}${donation.bukti_pembayaran}`, "_blank")}
                          >
                            <svg className="w-5 h-5 block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                          </button>
                        )}
                      </PermissionGate>
                      {/* For now we leave Edit to standard view editing flow to handle status or anything else */}
                      <PermissionGate permission={PERMISSIONS.EDIT_DONATIONS}>
                        <button
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                          title="View / Edit Details"
                          onClick={() => onEdit(donation)}
                        >
                          <svg
                            className="w-5 h-5 block"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                      </PermissionGate>

                      <PermissionGate permission={PERMISSIONS.DELETE_DONATIONS}>
                        {donation.status !== "verified" && (
                          <button
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 p-1.5 rounded-lg transition-colors ml-1"
                            title="Delete"
                            onClick={() => onDelete(donation)}
                          >
                            <svg
                              className="w-5 h-5 block"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              <line x1="10" x2="10" y1="11" y2="17" />
                              <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
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
      {/* Pagination */}

    </div>
  );
};
