import { LayoutGrid, Edit, Trash2, Users } from "lucide-react";
import {
  Division,
  DivisionsStatRes,
  getDivision,
} from "@/features/divisions/services/divisionService";
import { PermissionGate } from "@/components/guard";
import { PERMISSIONS } from "@/lib/permissions";
import { useState } from "react";

const DIVISION_COLORS = [
  {
    color: "text-primary",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
  },
  {
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
  },
  {
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-200 dark:border-pink-800",
  },
  {
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    border: "border-cyan-200 dark:border-cyan-800",
  },
  {
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  {
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
  },
];

export const DivisionCard = ({
  division,
  index,
  onEdit,
  onDelete,
}: {
  division: DivisionsStatRes;
  index: number;
  onEdit: (d: Division) => void;
  onDelete: (d: Division) => void;
}) => {
  const palette = DIVISION_COLORS[index % DIVISION_COLORS.length];
  const memberCount = division.user_count ?? 0;
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  const handleEdit = async () => {
    try {
      setIsLoadingEdit(true);
      const res = await getDivision(division.division_id);
      onEdit(res.data);
    } catch {
      // handle error jika perlu
    } finally {
      setIsLoadingEdit(false);
    }
  };
  return (
    <div
      className={`group relative bg-surface-light dark:bg-surface-dark rounded-xl border ${palette.border} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
    >
      {/* Top accent bar */}
      <div
        className={`h-1 w-full ${palette.bg.replace("bg-", "bg-").replace("/20", "")}`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${palette.bg}`}>
              <LayoutGrid className={`w-5 h-5 ${palette.color}`} />
            </div>
            <div>
              <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark text-sm leading-tight">
                {division.nama_divisi}
              </h3>
              {/* {division.deskripsi && (
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 line-clamp-1">
                  {division.deskripsi}
                </p>
              )} */}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <PermissionGate permission={PERMISSIONS.EDIT_DIVISIONS}>
              <button
                onClick={handleEdit}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-text-secondary-light hover:text-primary transition-colors"
              >
                {isLoadingEdit ? (
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  <Edit className="w-4 h-4" />
                )}
              </button>
            </PermissionGate>
            <PermissionGate permission={PERMISSIONS.DELETE_DIVISIONS}>
              <button
                onClick={() =>
                  onDelete({
                    id: division.division_id,
                    nama_divisi: division.nama_divisi,
                  })
                }
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-secondary-light hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Member count */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Users className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            <span className={`font-bold ${palette.color}`}>{memberCount}</span>{" "}
            anggota
          </span>
        </div>
      </div>
    </div>
  );
};
