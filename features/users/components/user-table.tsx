import {
  User,
  isDivisionUser,
  isDivisionMe,
} from "@/features/auth/contexts/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ================= CONFIG ================= */

const statusConfig: Record<
  User["status"],
  { label: string; colorClass: string }
> = {
  aktif: {
    label: "Aktif",
    colorClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  nonaktif: {
    label: "Nonaktif",
    colorClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  alumni: {
    label: "Alumni",
    colorClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  member: "Anggota",
  guest: "Tamu",
};

/* ================= TYPES ================= */

type Props = {
  users: User[];

  pagination?: {
    total: number;
    total_pages: number;
  };

  currentPage: number;
  pageSize: number;

  onPageChange: (page: number) => void;

  onEdit: (user: User) => void;
  onDelete: (user: User) => void;

  onStatusChange: (user: User, status: User["status"]) => void;

  onAssignDivision?: (user: User) => void;
  onManageRoles?: (user: User) => void;
};

/* ================= COMPONENT ================= */

export const UsersTable = ({
  users,
  pagination,
  currentPage,
  pageSize,

  onPageChange,
  onEdit,
  onDelete,
  onStatusChange,

  onAssignDivision,
  onManageRoles,
}: Props) => {
  const { can } = usePermission();
  const totalPages = pagination?.total_pages ?? 1;
  const totalData = pagination?.total ?? 0;

  const start = users.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const end = Math.min(currentPage * pageSize, totalData);

  return (
    <>
      <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
        <thead className="bg-slate-50/50 dark:bg-slate-800">
          <tr>
            <th
              scope="col"
              className="px-6 py-4 text-left text-xs font-semibold text-subtext-light dark:text-subtext-dark uppercase tracking-wider"
            >
              <div className="flex items-center gap-2 cursor-pointer group">
                Nama
                <span className="material-icons text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  sort
                </span>
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-4 text-left text-xs font-semibold text-subtext-light dark:text-subtext-dark uppercase tracking-wider"
            >
              <div className="flex items-center gap-2 cursor-pointer group">
                Kontak
                <span className="material-icons text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  sort
                </span>
              </div>
            </th>
            <th
              scope="col"
              className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-subtext-light dark:text-subtext-dark uppercase tracking-wider"
            >
              Divisi
            </th>
            <th
              scope="col"
              className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-subtext-light dark:text-subtext-dark uppercase tracking-wider"
            >
              Angkatan
            </th>
            <th
              scope="col"
              className="px-6 py-4 text-left text-xs font-semibold text-subtext-light dark:text-subtext-dark uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-4 text-right text-xs font-semibold text-subtext-light dark:text-subtext-dark uppercase tracking-wider"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-background-light dark:bg-slate-900 divide-y divide-border-light dark:divide-border-dark">
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-8 text-center text-muted-foreground font-medium"
              >
                Tidak ada data anggota.
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const isActive = user.status === "aktif";
              const isAlumni = user.status === "alumni";
              const isInactive = user.status === "nonaktif";

              const badgeColor = isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800"
                : isAlumni
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                  : isInactive
                    ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800"
                    : "bg-gray-100 text-gray-800 border-gray-200";

              const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama || "User")}&background=random`;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-background-light dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          alt=""
                          src={avatarUrl}
                          className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.nama}
                        </div>
                        <div className="text-xs text-subtext-light dark:text-subtext-dark">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {user.nomor_telepon || "-"}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary mr-2"></span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {isDivisionUser(user.division)
                          ? user.division.nama_divisi
                          : isDivisionMe(user.division)
                            ? user.division.name
                            : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.angkatan || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${badgeColor}`}
                    >
                      {statusConfig[user.status]?.label || user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-primary dark:hover:text-primary mx-1 transition-colors p-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {can(PERMISSIONS.EDIT_USERS) && (
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {can(PERMISSIONS.EDIT_USERS) && (
                          <>
                            {user.status !== "aktif" && (
                              <DropdownMenuItem
                                onClick={() => onStatusChange(user, "aktif")}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Aktifkan
                              </DropdownMenuItem>
                            )}
                            {user.status !== "nonaktif" && (
                              <DropdownMenuItem
                                onClick={() => onStatusChange(user, "nonaktif")}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Nonaktifkan
                              </DropdownMenuItem>
                            )}
                            {user.status !== "alumni" && (
                              <DropdownMenuItem
                                onClick={() => onStatusChange(user, "alumni")}
                              >
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Tandai Alumni
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuSeparator />
                        {can(PERMISSIONS.ASSIGN_ROLES) && (
                          <DropdownMenuItem
                            onClick={() =>
                              onAssignDivision && onAssignDivision(user)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Pindah Divisi
                          </DropdownMenuItem>
                        )}
                        {can(PERMISSIONS.ASSIGN_ROLES) && (
                          <DropdownMenuItem
                            onClick={() => onManageRoles && onManageRoles(user)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Kelola Role
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {can(PERMISSIONS.DELETE_USERS) && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(user)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* ================= PAGINATION ================= */}
      <div className="bg-slate-50/50 dark:bg-slate-800 border-t border-border-light dark:border-border-dark px-6 py-4 flex items-center justify-between">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-subtext-light dark:text-subtext-dark">
              Menampilkan{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {start}
              </span>{" "}
              hingga{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {end}
              </span>{" "}
              dari{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {totalData}
              </span>{" "}
              data
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                      ? "z-10 bg-primary/10 border-primary text-primary"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
        <div className="flex items-center justify-between sm:hidden w-full">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};
