import { Search, FilterX } from "lucide-react";
import { useDivisionsSelect } from "@/lib/services/selectService";

type Props = {
  search: string;
  status: string;
  division: string;
  angkatan?: number;
  sort: string;
  order: "ASC" | "DESC";
  onSearch: (v: string) => void;
  onStatusChange: (v: string) => void;
  onDivisionChange: (v: string) => void;
  onAngkatanChange: (v?: number) => void;
  onSortChange: (v: string) => void;
  onOrderChange: (v: "ASC" | "DESC") => void;
};
export const UsersFilters = ({
  search,
  status,
  division,
  angkatan,
  sort,
  order,
  onSearch,
  onStatusChange,
  onDivisionChange,
  onAngkatanChange,
  onSortChange,
  onOrderChange,
}: Props) => {
  const { data: divisions = [] } = useDivisionsSelect();
  const currentYear = new Date().getFullYear();
  const angkatanOptions = Array.from(
    { length: currentYear - 2000 + 1 },
    (_, i) => currentYear - i,
  );

  const handleReset = () => {
    onSearch("");
    onStatusChange("");
    onDivisionChange("");
    onAngkatanChange(undefined);
    onSortChange("created_at");
    onOrderChange("DESC");
  };

  return (
    <div className="px-6 py-4 bg-surface-container-low flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}
      <div className="relative w-full lg:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          value={search}
          name="global-search-users"
          autoComplete="off"
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 w-full bg-surface-container-lowest rounded-xl border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant outline-none transition-all"
          placeholder="Cari nama, email, nim..."
          type="text"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-3 pr-8 rounded-xl text-sm font-medium cursor-pointer outline-none transition-all appearance-none"
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
          <option value="alumni">Alumni</option>
        </select>

        <select
          value={division}
          onChange={(e) => onDivisionChange(e.target.value)}
          className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-3 pr-8 rounded-xl text-sm font-medium cursor-pointer outline-none transition-all appearance-none"
        >
          <option value="">Semua Divisi</option>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {divisions.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={angkatan ?? ""}
          onChange={(e) =>
            onAngkatanChange(
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-3 pr-8 rounded-xl text-sm font-medium cursor-pointer outline-none transition-all appearance-none"
        >
          <option value="">Semua Angkatan</option>
          {angkatanOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-2 pl-3 pr-8 rounded-xl text-sm font-medium cursor-pointer outline-none transition-all appearance-none"
        >
          <option value="created_at">Urutkan: Dibuat</option>
          <option value="nama">Urutkan: Nama</option>
          <option value="email">Urutkan: Email</option>
          <option value="angkatan">Urutkan: Angkatan</option>
          <option value="status">Urutkan: Status</option>
        </select>

        <button
          onClick={() => onOrderChange(order === "ASC" ? "DESC" : "ASC")}
          className="px-3 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
          title="Toggle urutan"
        >
          {order === "ASC" ? "Asc" : "Desc"}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          title="Reset Filters"
        >
          <FilterX className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
};
