import { User } from "@/contexts/AuthContext";
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
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  aktif: { label: "Aktif", variant: "default" },
  nonaktif: { label: "Nonaktif", variant: "secondary" },
  alumni: { label: "Alumni", variant: "outline" },
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
    <div className="overflow-hidden rounded-lg border bg-background">
      {/* ================= TABLE ================= */}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead className="hidden md:table-cell">Angkatan</TableHead>
            <TableHead className="hidden sm:table-cell">Divisi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Role</TableHead>
            <TableHead className="hidden lg:table-cell">Kontak</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada data anggota.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                {/* ================= NAME ================= */}

                <TableCell>
                  <div>
                    <p className="font-medium">{user.nama}</p>
                    <p className="text-xs text-muted-foreground">
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
                  {user.division?.nama_divisi || "-"}
                </TableCell>

                {/* ================= STATUS ================= */}

                <TableCell>
                  <Badge variant={statusConfig[user.status].variant}>
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
            ))
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
