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
    <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-6">
      {/* ================= TABLE ================= */}

      <Table>
        <TableHeader className="bg-muted/50 border-b-0">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground h-11 pl-4">
              Nama
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-foreground h-11">
              Angkatan
            </TableHead>
            <TableHead className="hidden sm:table-cell font-semibold text-foreground h-11">
              Divisi
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Status
            </TableHead>
            <TableHead className="hidden lg:table-cell font-semibold text-foreground h-11">
              Role
            </TableHead>
            <TableHead className="hidden lg:table-cell font-semibold text-foreground h-11">
              Kontak
            </TableHead>
            <TableHead className="w-[70px] h-11 pr-4"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-muted-foreground font-medium"
              >
                Tidak ada data anggota.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const status = statusConfig[user.status] || {
                label: user.status,
                colorClass: "bg-gray-100 text-gray-800 border-gray-200",
              };
              return (
                <TableRow
                  key={user.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  {/* ================= NAME ================= */}

                  <TableCell className="pl-4">
                    <div>
                      <p className="font-semibold text-foreground">
                        {user.nama}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </TableCell>

                  {/* ================= ANGKATAN ================= */}

                  <TableCell className="hidden md:table-cell">
                    {user.angkatan || "-"}
                  </TableCell>

                  {/* ================= DIVISION ================= */}

                  <TableCell className="hidden sm:table-cell">
                    {isDivisionUser(user.division)
                      ? user.division.nama_divisi
                      : isDivisionMe(user.division)
                        ? user.division.name
                        : "-"}
                  </TableCell>

                  {/* ================= STATUS ================= */}

                  <TableCell>
                    <Badge className={statusConfig[user.status].colorClass}>
                      {statusConfig[user.status].label}
                    </Badge>
                  </TableCell>

                  {/* ================= ROLE ================= */}

                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {user.roles?.[0]?.name || "-"}
                    </span>
                  </TableCell>

                  {/* ================= CONTACT ================= */}

                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {user.nomor_telepon || "-"}
                    </span>
                  </TableCell>

                  {/* ================= ACTION ================= */}

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {/* Edit */}
                        {can(PERMISSIONS.EDIT_USERS) && (
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {/* Status */}
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

                        {/* Division & Roles */}
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

                        {/* Delete */}
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
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* ================= PAGINATION ================= */}

      <div className="flex items-center justify-between border-t px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Menampilkan {start}–{end} dari {totalData}
        </p>

        <div className="flex items-center gap-1">
          {/* Prev */}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Pages */}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="icon"
              className="h-8 w-8"
              variant={page === currentPage ? "default" : "outline"}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}

          {/* Next */}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
