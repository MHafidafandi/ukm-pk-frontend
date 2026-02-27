"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Asset } from "../services/assetService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type Props = {
  assets: Asset[];
};

const conditionColor: Record<string, { label: string; colorClass: string }> = {
  baik: {
    label: "Baik",
    colorClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  rusak_ringan: {
    label: "Rusak Ringan",
    colorClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  rusak_berat: {
    label: "Rusak Berat",
    colorClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  hilang: {
    label: "Hilang",
    colorClass:
      "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  },
  dipinjam: {
    label: "Dipinjam",
    colorClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  dalam_perbaikan: {
    label: "Perbaikan",
    colorClass:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
};

export const AssetTable = ({ assets }: Props) => {
  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-muted/50 rounded-t-xl border-b-0">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="font-semibold text-foreground rounded-tl-xl h-11">
              Nama / Kode
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Kategori / Judul
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Kondisi
            </TableHead>
            <TableHead className="font-semibold text-foreground text-center h-11">
              Stok
            </TableHead>
            <TableHead className="font-semibold text-foreground h-11">
              Lokasi
            </TableHead>
            <TableHead className="w-[70px] rounded-tr-xl h-11"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-32 text-center text-muted-foreground font-medium"
              >
                Belum ada data aset.
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => {
              const condition = conditionColor[asset.kondisi] || {
                label: asset.kondisi.replace("_", " "),
                colorClass: "bg-gray-100 text-gray-800 border-gray-200",
              };
              return (
                <TableRow
                  key={asset.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="font-semibold text-foreground">
                      {asset.nama}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-0.5">
                      {asset.kode}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {asset.judul || "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${condition.colorClass}`}
                    >
                      {condition.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {asset.available} / {asset.jumlah}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {asset.lokasi}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4 text-primary" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
