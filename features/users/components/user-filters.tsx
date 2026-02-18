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

  onSearch: (v: string) => void;
  onStatusChange: (v: string) => void;
  onDivisionChange: (v: string) => void;
};

export const UsersFilters = ({
  search,
  status,
  division,
  onSearch,
  onStatusChange,
  onDivisionChange,
}: Props) => {
  const divisionsQuery = useDivisions();
  const divisions = divisionsQuery.data?.data.map((d) => d.nama_divisi) || [];
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filter & Pencarian</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              placeholder="Cari..."
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={status} onValueChange={onStatusChange}>
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
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="Divisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {divisions.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
