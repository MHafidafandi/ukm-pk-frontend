import { Search, ChevronDown, FilterX } from "lucide-react";
import { useDivisionContext } from "@/features/divisions/contexts/DivisionContext";

type Props = {
  search: string;
  status: string;
  division: string;
  angkatan?: number;

  onSearch: (v: string) => void;
  onStatusChange: (v: string) => void;
  onDivisionChange: (v: string) => void;
  onAngkatanChange: (v?: number) => void;
};

export const UsersFilters = ({
  search,
  status,
  division,
  angkatan,
  onSearch,
  onStatusChange,
  onDivisionChange,
  onAngkatanChange,
}: Props) => {
  const { divisions } = useDivisionContext();
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
  };

  return (
    <div className="p-5 border-b border-border-light dark:border-border-dark flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-slate-50/50 dark:bg-slate-900">
      <div className="relative w-full lg:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400 h-5 w-5" />
        </div>
        <input
          value={search}
          name="global-search-users"
          autoComplete="off"
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-2.5 shadow-sm transition-shadow outline-none"
          placeholder="Cari nama, email, nim..."
          type="text"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 pl-4 pr-10 rounded-xl leading-tight focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer text-sm font-medium shadow-sm"
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
            <option value="alumni">Alumni</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <div className="relative">
          <select
            value={division}
            onChange={(e) => onDivisionChange(e.target.value)}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 pl-4 pr-10 rounded-xl leading-tight focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer text-sm font-medium shadow-sm"
          >
            <option value="">Semua Divisi</option>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {divisions.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.nama_divisi}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <div className="relative">
          <select
            value={angkatan ?? ""}
            onChange={(e) =>
              onAngkatanChange(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 pl-4 pr-10 rounded-xl leading-tight focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer text-sm font-medium shadow-sm"
          >
            <option value="">Semua Angkatan</option>
            {angkatanOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center justify-center p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shadow-sm bg-white dark:bg-gray-800"
          title="Reset Filters"
        >
          <FilterX className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
