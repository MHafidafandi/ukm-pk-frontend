import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Registrant } from "@/features/recruitment/services/recruitmentService";
import { Pagination } from "@/features/recruitment/services/recruitmentService";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ========================
// PROPS
// ========================
type Props = {
  registrants: Registrant[];
  isLoading?: boolean;
  pagination: Pagination | null;
  onPageChange: (page: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onAcceptRegistrant?: (registrant: Registrant) => void;
  onRejectRegistrant?: (registrant: Registrant) => void;
};

// ========================
// STATUS CONFIG
// ========================
const statusConfig: Record<
  string,
  { label: string; colorClass: string }
> = {
  pending: {
    label: "Pending",
    colorClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  interview: {
    label: "Interview",
    colorClass:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  accepted: {
    label: "Accepted",
    colorClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    colorClass:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "interview", label: "Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

// ========================
// COMPONENT
// ========================
export const RegistrantsTable = ({
  registrants,
  isLoading = false,
  pagination,
  onPageChange,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAcceptRegistrant,
  onRejectRegistrant,
}: Props) => {
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.total_pages ?? 1;
  const totalItems = pagination?.total ?? registrants.length;

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full lg:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="size-4" />
          </div>
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
            placeholder="Search registrant..."
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {totalItems} registrants
          </p>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b-0">
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="font-semibold text-foreground h-11 pl-4">
                Name
              </TableHead>
              <TableHead className="font-semibold text-foreground h-11">
                Email/Contact
              </TableHead>
              <TableHead className="font-semibold text-foreground h-11">
                Registered Date
              </TableHead>
              <TableHead className="font-semibold text-foreground h-11">
                Status
              </TableHead>
              <TableHead className="w-[70px] h-11 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading state */}
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">
                      Loading...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : registrants.length === 0 ? (
              /* Empty state */
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground font-medium"
                >
                  {searchValue || statusFilter !== "all"
                    ? "No registrant found matching the filter."
                    : "No registrant yet."}
                </TableCell>
              </TableRow>
            ) : (
              /* Data rows */
              registrants.map((item) => {
                const status = statusConfig[item.status] || {
                  label: item.status,
                  colorClass: "bg-gray-100 text-gray-800 border-gray-200",
                };

                return (
                  <TableRow
                    key={item.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="pl-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.nama}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                          {item.nim}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.nomor_telepon || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground">
                      {format(
                        new Date(item.created_at || new Date()),
                        "dd MMM yyyy HH:mm",
                        { locale: idLocale }
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${status.colorClass}`}
                      >
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4">
                      {(item.status === "pending" ||
                        item.status === "interview") && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-muted"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                                Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onAcceptRegistrant?.(item)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                Accept
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer focus:text-destructive focus:bg-destructive/10"
                                onClick={() => onRejectRegistrant?.(item)}
                              >
                                <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                      {item.status === "accepted" && (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                      )}
                      {item.status === "rejected" && (
                        <XCircle className="h-4 w-4 text-red-400 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};