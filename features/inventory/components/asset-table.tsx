"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Asset, AssetCondition } from "../types";
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

// Map condition to badge variant
// "default" | "secondary" | "destructive" | "outline"
const conditionColor: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  baik: "default", // success looking (usually)
  rusak_ringan: "secondary", // warning
  rusak_berat: "destructive", // error
  hilang: "destructive",
  dipinjam: "outline",
  dalam_perbaikan: "secondary",
};

export const AssetTable = ({ assets }: Props) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama / Kode</TableHead>
            <TableHead>Kategori / Judul</TableHead>
            <TableHead>Kondisi</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Belum ada data aset.
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>
                  <div className="font-medium">{asset.nama}</div>
                  <div className="text-xs text-muted-foreground">
                    {asset.kode}
                  </div>
                </TableCell>
                <TableCell>{asset.judul || "-"}</TableCell>
                <TableCell>
                  <Badge variant={conditionColor[asset.kondisi] || "outline"}>
                    {asset.kondisi.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  {asset.available} / {asset.jumlah}
                </TableCell>
                <TableCell>{asset.lokasi}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
