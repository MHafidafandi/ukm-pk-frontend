import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Registrant,
  Pagination,
} from "@/features/recruitment/services/recruitmentService";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  registrants: Registrant[];
  isLoading?: boolean;
  pagination: Pagination | null;
  onPageChange: (page: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  order: "ASC" | "DESC";
  onOrderChange: (value: "ASC" | "DESC") => void;
  onAcceptRegistrant?: (registrant: Registrant) => void;
  onRejectRegistrant?: (registrant: Registrant) => void;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-secondary-container text-on-secondary-container",
  },
  interview: {
    label: "Interview",
    className: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  },
  accepted: {
    label: "Accepted",
    className: "bg-primary-fixed text-on-primary-fixed-variant",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive",
  },
};

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "interview", label: "Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export const RegistrantsTable = ({
  registrants,
  isLoading = false,
  pagination,
  onPageChange,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
  order,
  onOrderChange,
  onAcceptRegistrant,
  onRejectRegistrant,
}: Props) => {
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.total_pages ?? 1;
  const totalItems = pagination?.total ?? registrants.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            className=" w-full pl-10 pr-4 bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 py-2.5 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant outline-none transition-all"
            placeholder="Cari pendaftar..."
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className=" text-sm text-on-surface-variant">
            {totalItems} pendaftar
          </span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className=" bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-3 pr-8 rounded-xl text-sm font-medium cursor-pointer outline-none transition-all appearance-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className=" bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-3 pr-8 rounded-xl text-sm font-medium cursor-pointer outline-none transition-all appearance-none"
          >
            <option value="created_at">Urut: Dibuat</option>
            <option value="nama">Urut: Nama</option>
            <option value="email">Urut: Email</option>
            <option value="status">Urut: Status</option>
          </select>

          <button
            onClick={() => onOrderChange(order === "ASC" ? "DESC" : "ASC")}
            className="px-3 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            {order === "ASC" ? "Asc" : "Desc"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
                Nama
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
                Email / Kontak
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
                Tanggal Daftar
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant ">
                Status
              </th>
              <th className="px-6 py-4 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-on-surface-variant">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className=" text-sm">Memuat...</span>
                  </div>
                </td>
              </tr>
            ) : registrants.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center  text-sm text-on-surface-variant"
                >
                  {searchValue || statusFilter !== "all"
                    ? "Tidak ada pendaftar yang cocok."
                    : "Belum ada pendaftar."}
                </td>
              </tr>
            ) : (
              registrants.map((item) => {
                const status = statusConfig[item.status] ?? {
                  label: item.status,
                  className: "bg-surface-container text-on-surface-variant",
                };
                return (
                  <tr
                    key={item.id}
                    className="group hover:bg-surface transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className=" font-semibold text-sm text-on-surface">
                        {item.nama}
                      </p>
                      <p className=" text-xs text-on-surface-variant mt-0.5">
                        {item.nim}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className=" text-sm text-on-surface">{item.email}</p>
                      <p className=" text-xs text-on-surface-variant mt-0.5">
                        {item.nomor_telepon || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4  text-sm text-on-surface-variant">
                      {format(
                        new Date(item.created_at || new Date()),
                        "dd MMM yyyy HH:mm",
                        { locale: idLocale },
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider  ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(item.status === "pending" ||
                        item.status === "interview") && (
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
                          <DropdownMenuContent align="end" className=" w-40">
                            <DropdownMenuLabel className="text-xs font-semibold text-on-surface-variant">
                              Aksi
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => onAcceptRegistrant?.(item)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-on-primary-fixed-variant" />
                              Terima
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer focus:text-destructive focus:bg-destructive/10"
                              onClick={() => onRejectRegistrant?.(item)}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-destructive" />
                              Tolak
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {item.status === "accepted" && (
                        <CheckCircle className="h-4 w-4 text-on-primary-fixed-variant mx-auto" />
                      )}
                      {item.status === "rejected" && (
                        <XCircle className="h-4 w-4 text-destructive mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <p className=" text-sm text-on-surface-variant">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
