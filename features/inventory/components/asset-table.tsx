"use client";

import { Asset } from "../services/assetService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type Props = {
  assets: Asset[];
  onEdit?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
};

// ── Condition config ──────────────────────────────────────────────────────────
const CONDITION_MAP: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  baik: {
    label: "Baik",
    bg: "bg-primary-fixed",
    text: "text-on-primary-fixed-variant",
  },
  rusak_ringan: {
    label: "Rusak Ringan",
    bg: "bg-tertiary-fixed",
    text: "text-on-tertiary-fixed-variant",
  },
  rusak_berat: {
    label: "Rusak Berat",
    bg: "bg-error-container",
    text: "text-on-error-container",
  },
  hilang: {
    label: "Hilang",
    bg: "bg-surface-container-highest",
    text: "text-on-surface-variant",
  },
  dipinjam: {
    label: "Dipinjam",
    bg: "bg-secondary-fixed",
    text: "text-on-secondary-fixed-variant",
  },
  dalam_perbaikan: {
    label: "Perbaikan",
    bg: "bg-tertiary-fixed",
    text: "text-on-tertiary-fixed-variant",
  },
};

const ConditionBadge = ({ kondisi }: { kondisi: string }) => {
  const cfg = CONDITION_MAP[kondisi] ?? {
    label: kondisi.replace(/_/g, " "),
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
export const AssetTable = ({ assets, onEdit, onDelete }: Props) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        {/* Header */}
        <thead>
          <tr className="bg-surface-container-high">
            {["Nama / Kode", "Judul", "Kondisi", "Stok", "Lokasi", ""].map(
              (h, i) => (
                <th
                  key={i}
                  className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ${
                    h === "Stok" ? "text-center" : ""
                  } ${h === "" ? "w-14" : ""}`}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-outline-variant/10">
          {assets.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="h-32 text-center text-on-surface-variant text-sm py-12"
              >
                Belum ada data aset.
              </td>
            </tr>
          ) : (
            assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-surface transition-colors">
                {/* Nama / Kode */}
                <td className="px-6 py-4">
                  <p className="font-semibold text-on-surface text-sm">
                    {asset.nama}
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    {asset.kode}
                  </p>
                </td>

                {/* Judul */}
                <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                  {asset.judul || "—"}
                </td>

                {/* Kondisi */}
                <td className="px-6 py-4">
                  <ConditionBadge kondisi={asset.kondisi} />
                </td>

                {/* Stok */}
                <td className="px-6 py-4 text-center">
                  <span className="font-['Manrope'] font-bold text-on-surface text-sm">
                    {asset.available}
                  </span>
                  <span className="text-on-surface-variant text-xs">
                    {" "}
                    / {asset.jumlah}
                  </span>
                </td>

                {/* Lokasi */}
                <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                  {asset.lokasi}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      {onEdit && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onEdit(asset)}
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5 text-primary" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          className="text-error cursor-pointer focus:text-error focus:bg-error-container/20"
                          onClick={() => onDelete(asset)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Hapus
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
