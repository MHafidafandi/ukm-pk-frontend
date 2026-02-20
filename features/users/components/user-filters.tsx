import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDivisions } from "@/features/divisions/api/get-divisions";

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
  const divisionsQuery = useDivisions();
  // ... (rest of logic)

  return (
    <Card>
      {/* ... header ... */}
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            {/* ... search input ... */}
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              placeholder="Cari..."
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Input
            type="number"
            placeholder="Angkatan"
            value={angkatan ?? ""}
            onChange={(e) =>
              onAngkatanChange(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className="w-full sm:w-32"
          />

          <Select value={status} onValueChange={onStatusChange}>
            {/* ... status select ... */}
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
              <SelectItem value="alumni">Alumni</SelectItem>
            </SelectContent>
          </Select>

          <Select value={division} onValueChange={onDivisionChange}>
            {/* ... division select ... */}
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="Divisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {divisionsQuery.data?.data.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nama_divisi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
