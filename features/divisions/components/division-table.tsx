import { Edit, Trash2, Users } from "lucide-react";
import {
  Division,
  DivisionsStatRes,
  getDivision,
} from "@/features/divisions/services/divisionService";
import { PermissionGate } from "@/components/guard";
import { PERMISSIONS } from "@/lib/permissions";
import { useState } from "react";

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
  const memberCount = division.user_count ?? 0;
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  // Icons for divisions (cycling through relevant icons)
  const icons = [
    "🚀", // R&D
    "📊", // Sales/Marketing
    "⚙️", // Operations
    "👥", // HR
    "⚖️", // Legal
    "🎯", // General
    "🔬", // Research
    "💼", // Business
  ];
  const icon = icons[index % icons.length];

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
    <div className="group bg-surface-container-lowest rounded-xl p-6 transition-all duration-200 hover:shadow-md border border-outline-variant/10 hover:border-outline-variant/30">
      {/* Header with Icon and Actions */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-3 bg-secondary-container rounded-xl flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-['Manrope'] font-bold text-on-surface text-base leading-tight">
              {division.nama_divisi}
            </h3>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <PermissionGate permission={PERMISSIONS.EDIT_DIVISIONS}>
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
              disabled={isLoadingEdit}
            >
              {isLoadingEdit ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
              className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Member Stats */}
      <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/10">
        <div className="w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center">
          <Users className="w-3 h-3 text-on-secondary-container" />
        </div>
        <span className="font-['Manrope'] text-sm font-bold text-on-surface">
          {memberCount}
          <span className="font-medium text-on-surface-variant ms-1">
            members
          </span>
        </span>
        <span className="text-xs text-on-surface-variant ms-auto">
          {division.percentage}%
        </span>
      </div>
    </div>
  );
};
