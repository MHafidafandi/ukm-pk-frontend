import {
  User,
  isDivisionUser,
  isDivisionMe,
} from "@/features/auth/contexts/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { env } from "@/configs/env";

/* ── Status badge config ── */
const statusConfig: Record<
  User["status"],
  { label: string; className: string }
> = {
  aktif: {
    label: "Aktif",
    className: "bg-primary-fixed text-on-primary-fixed-variant",
  },
  nonaktif: {
    label: "Nonaktif",
    className: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  },
  alumni: {
    label: "Alumni",
    className: "bg-secondary-fixed text-on-secondary-fixed-variant",
  },
};

/* ── Types ── */
type Props = {
  users: User[];
  pagination?: { total: number; total_pages: number };
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onStatusChange: (user: User, status: User["status"]) => void;
  onAssignDivision?: (user: User) => void;
  onManageRoles?: (user: User) => void;
};

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

  const getAvatarSrc = (user: User) => {
    if (!user.avatar_url) return "";
    return user.avatar_url.startsWith("http")
      ? user.avatar_url
      : `${env.MEDIA_URL}${user.avatar_url}`;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  return (
    <>
      <table className="min-w-full border-collapse">
        {/* ── Head ── */}
        <thead>
          <tr className="bg-surface-container-high">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-on-surface-variant font-interface">
              Nama & Identitas
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-on-surface-variant font-interface">
              Kontak
            </th>
            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-on-surface-variant font-interface">
              Divisi
            </th>
            <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-on-surface-variant font-interface">
              Angkatan
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-on-surface-variant font-interface">
              Status
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-on-surface-variant font-interface">
              Aksi
            </th>
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody className="divide-y divide-outline-variant/10">
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-12 text-center text-sm text-on-surface-variant"
              >
                Tidak ada data anggota.
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const badge = statusConfig[user.status];
              const avatarSrc = getAvatarSrc(user);

              return (
                <tr
                  key={user.id}
                  className="group hover:bg-surface transition-colors"
                >
                  {/* Nama */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage
                          src={avatarSrc || undefined}
                          alt={user.nama}
                        />
                        <AvatarFallback className="bg-secondary-container text-on-secondary-container text-sm font-bold">
                          {getInitials(user.nama || "User")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-on-surface">
                          {user.nama}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {user.email}
                          {user.username && (
                            <>
                              {" "}
                              ·{" "}
                              <span className="font-medium">
                                {user.username}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Kontak */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-sm text-on-surface-variant">
                      {user.nomor_telepon || "-"}
                    </span>
                  </td>

                  {/* Divisi */}
                  <td className="hidden sm:table-cell px-6 py-5 whitespace-nowrap">
                    <p className="text-sm font-semibold text-on-surface">
                      {isDivisionUser(user.division)
                        ? user.division.nama_divisi
                        : isDivisionMe(user.division)
                          ? user.division.name
                          : "-"}
                    </p>
                    {user.angkatan && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">
                        Angkatan {user.angkatan}
                      </p>
                    )}
                  </td>

                  {/* Angkatan */}
                  <td className="hidden md:table-cell px-6 py-5 whitespace-nowrap text-sm text-on-surface-variant">
                    {user.angkatan || "-"}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge?.className}`}
                    >
                      {badge?.label || user.status}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="font-interface"
                      >
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

      {/* ── Pagination ── */}
      <div className="bg-surface-container-low px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-on-surface-variant">
          Menampilkan <span className="font-bold text-on-surface">{start}</span>{" "}
          – <span className="font-bold text-on-surface">{end}</span> dari{" "}
          <span className="font-bold text-on-surface">{totalData}</span> data
        </p>

        <nav className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-lowest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                currentPage === page
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-lowest"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-lowest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </>
  );
};
