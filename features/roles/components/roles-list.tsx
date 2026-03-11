"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Edit3,
  Users,
  Box,
  Heart,
  Settings,
  Save,
  FolderOpen,
  FileText,
  ClipboardList,
  BookOpen,
  Package,
  UserPlus,
  Shield,
  LayoutGrid,
} from "lucide-react";

import { useRoleContext } from "@/features/roles/contexts/RoleContext";
import { Role } from "@/features/roles/services/roleService";
import { PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

import { RoleFormDialog } from "./role-form-dialog";
import { RoleDeleteDialog } from "./role-delete-dialog";
import { PermissionGate } from "@/components/PermissionGate";

const createRoleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
  permissions: z.array(z.string()).optional(),
});

type CreateRoleInput = z.infer<typeof createRoleSchema>;

const emptyForm: CreateRoleInput = {
  name: "",
  permissions: [],
};

// ── Permission Groups ──────────────────────────────────────────────────────

const PERMISSION_GROUPS = [
  {
    id: "users",
    label: "User Management",
    desc: "Akun, profil, dan role",
    icon: Users,
    color: "text-primary",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_USERS,
      create: PERMISSIONS.CREATE_USERS,
      update: PERMISSIONS.EDIT_USERS,
      delete: PERMISSIONS.DELETE_USERS,
      extra: [{ label: "Assign Roles", value: PERMISSIONS.ASSIGN_ROLES }],
    },
  },
  {
    id: "roles",
    label: "Role Management",
    desc: "Role dan permissions",
    icon: Shield,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_ROLES,
      create: PERMISSIONS.CREATE_ROLES,
      update: PERMISSIONS.EDIT_ROLES,
      delete: PERMISSIONS.DELETE_ROLES,
      extra: [
        { label: "Manage Permissions", value: PERMISSIONS.MANAGE_PERMISSIONS },
      ],
    },
  },
  {
    id: "divisions",
    label: "Division Management",
    desc: "Divisi organisasi",
    icon: LayoutGrid,
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_DIVISIONS,
      create: PERMISSIONS.CREATE_DIVISIONS,
      update: PERMISSIONS.EDIT_DIVISIONS,
      delete: PERMISSIONS.DELETE_DIVISIONS,
    },
  },
  {
    id: "activities",
    label: "Activity Progress",
    desc: "Kegiatan dan progress",
    icon: ClipboardList,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_ACTIVITIES,
      create: PERMISSIONS.CREATE_ACTIVITIES,
      update: PERMISSIONS.EDIT_ACTIVITIES,
      delete: PERMISSIONS.DELETE_ACTIVITIES,
    },
  },
  {
    id: "documents",
    label: "Documents",
    desc: "Dokumen organisasi",
    icon: FileText,
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_DOCUMENTS,
      create: PERMISSIONS.CREATE_DOCUMENTS,
      update: PERMISSIONS.EDIT_DOCUMENTS,
      delete: PERMISSIONS.DELETE_DOCUMENTS,
    },
  },
  {
    id: "documentations",
    label: "Documentations",
    desc: "Dokumentasi kegiatan",
    icon: FolderOpen,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_DOCUMENTATIONS,
      create: PERMISSIONS.CREATE_DOCUMENTATIONS,
      update: PERMISSIONS.EDIT_DOCUMENTATIONS,
      delete: PERMISSIONS.DELETE_DOCUMENTATIONS,
      extra: [{ label: "Archive", value: PERMISSIONS.ARCHIVE_DOCUMENTATIONS }],
    },
  },
  {
    id: "lpj",
    label: "LPJ",
    desc: "Laporan pertanggungjawaban",
    icon: BookOpen,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_LPJ,
      create: PERMISSIONS.CREATE_LPJ,
      update: PERMISSIONS.EDIT_LPJ,
      delete: PERMISSIONS.DELETE_LPJ,
    },
  },
  {
    id: "progress_reports",
    label: "Progress Reports",
    desc: "Laporan perkembangan",
    icon: ClipboardList,
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_PROGRESS_REPORTS,
      create: PERMISSIONS.CREATE_PROGRESS_REPORTS,
      update: PERMISSIONS.EDIT_PROGRESS_REPORTS,
      delete: PERMISSIONS.DELETE_PROGRESS_REPORTS,
    },
  },
  {
    id: "donations",
    label: "Donations",
    desc: "Dana masuk dan donatur",
    icon: Heart,
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_DONATIONS,
      create: PERMISSIONS.CREATE_DONATIONS,
      update: PERMISSIONS.EDIT_DONATIONS,
      delete: PERMISSIONS.DELETE_DONATIONS,
      extra: [{ label: "Verify", value: PERMISSIONS.VERIFY_DONATIONS }],
    },
  },
  {
    id: "assets",
    label: "Assets Inventory",
    desc: "Inventaris organisasi",
    icon: Box,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_ASSETS,
      create: PERMISSIONS.CREATE_ASSETS,
      update: PERMISSIONS.EDIT_ASSETS,
      delete: PERMISSIONS.DELETE_ASSETS,
    },
  },
  {
    id: "loans",
    label: "Loans",
    desc: "Peminjaman aset",
    icon: Package,
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_LOANS,
      create: PERMISSIONS.CREATE_LOANS,
      update: PERMISSIONS.EDIT_LOANS,
      delete: PERMISSIONS.DELETE_LOANS,
      extra: [{ label: "Manage", value: PERMISSIONS.MANAGE_LOANS }],
    },
  },
  {
    id: "recruitments",
    label: "Recruitment",
    desc: "Rekrutmen anggota baru",
    icon: UserPlus,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    permissions: {
      view: PERMISSIONS.VIEW_RECRUITMENTS,
      create: PERMISSIONS.CREATE_RECRUITMENTS,
      update: PERMISSIONS.EDIT_RECRUITMENTS,
      delete: PERMISSIONS.DELETE_RECRUITMENTS,
      extra: [
        { label: "Manage Registrants", value: PERMISSIONS.MANAGE_REGISTRANTS },
      ],
    },
  },
];

const ACTIONS = ["view", "create", "update", "delete"] as const;

const ACTION_ICONS = {
  view: Eye,
  create: PlusCircle,
  update: Edit3,
  delete: Trash2,
};

// ── Component ──────────────────────────────────────────────────────────────

export const RolesList = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const [form, setForm] = useState<CreateRoleInput>(emptyForm);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [currentPermissions, setCurrentPermissions] = useState<Set<string>>(
    new Set(),
  );
  const [isMatrixModified, setIsMatrixModified] = useState(false);

  const { roles, createRole, updateRole, deleteRole, isFetchingRoles } =
    useRoleContext();

  useEffect(() => {
    if (roles.length > 0 && !activeRole) {
      handleSelectRole(roles[0]);
    }
  }, [roles]);

  const handleSelectRole = (role: Role) => {
    setActiveRole(role);
    setCurrentPermissions(new Set(role.permissions || []));
    setIsMatrixModified(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setForm({ name: role.name, permissions: role.permissions || [] });
    setFormOpen(true);
  };

  const openDelete = (role: Role) => {
    setDeleting(role);
    setDeleteOpen(true);
  };

  const handleSaveRoleInfo = async () => {
    try {
      const parsed = createRoleSchema.parse(form);
      if (editing) {
        await updateRole({ id: editing.id, data: parsed });
        if (activeRole?.id === editing.id) {
          setActiveRole((prev) => (prev ? { ...prev, ...parsed } : null));
        }
      } else {
        await createRole(parsed);
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }
      toast.error("Gagal menyimpan role");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteRole(deleting.id);
      toast.success("Role dihapus");
      setDeleteOpen(false);
      if (activeRole?.id === deleting.id) setActiveRole(null);
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus role");
    }
  };

  const togglePermission = (permValue: string) => {
    const next = new Set(currentPermissions);
    if (next.has(permValue)) next.delete(permValue);
    else next.add(permValue);
    setCurrentPermissions(next);
    setIsMatrixModified(true);
  };

  const toggleGroupAll = (group: (typeof PERMISSION_GROUPS)[number]) => {
    const allPerms = [
      ...ACTIONS.map((a) => group.permissions[a]).filter(Boolean),
      ...(group.permissions.extra?.map((e) => e.value) ?? []),
    ];
    const next = new Set(currentPermissions);
    const hasAll = allPerms.every((p) => next.has(p));
    allPerms.forEach((p) => (hasAll ? next.delete(p) : next.add(p)));
    setCurrentPermissions(next);
    setIsMatrixModified(true);
  };

  const handleSaveMatrix = async () => {
    if (!activeRole) return;
    try {
      await updateRole({
        id: activeRole.id,
        data: {
          name: activeRole.name,
          permissions: Array.from(currentPermissions),
        },
      });
      setActiveRole((prev) =>
        prev ? { ...prev, permissions: Array.from(currentPermissions) } : null,
      );
      toast.success("Permissions berhasil disimpan");
      setIsMatrixModified(false);
    } catch {
      toast.error("Gagal menyimpan permissions");
    }
  };

  const handleDiscardMatrix = () => {
    if (activeRole) {
      setCurrentPermissions(new Set(activeRole.permissions || []));
      setIsMatrixModified(false);
    }
  };

  if (isFetchingRoles && roles.length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light dark:bg-background-dark min-h-[calc(100vh-4rem)] font-display text-text-primary-light dark:text-text-primary-dark">
      <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-6">
        {/* ── Left: Roles List ── */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Roles</h3>
            <PermissionGate permission={PERMISSIONS.CREATE_ROLES}>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </PermissionGate>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            {roles.map((role, idx) => {
              const isActive = activeRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={[
                    "flex items-center justify-between p-4 border-l-4 transition-colors w-full text-left group",
                    isActive
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    idx !== roles.length - 1
                      ? "border-b border-gray-100 dark:border-gray-800"
                      : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-sm font-bold",
                      isActive
                        ? "text-primary dark:text-primary-light"
                        : "text-text-primary-light dark:text-text-primary-dark",
                    ].join(" ")}
                  >
                    {role.name}
                  </span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {role.user_count ?? 0} users
                  </span>
                  <div
                    className={[
                      "flex gap-1 shrink-0 transition-opacity",
                      isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100",
                    ].join(" ")}
                  >
                    <PermissionGate permission={PERMISSIONS.EDIT_ROLES}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(role);
                        }}
                        className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 text-text-secondary-light hover:text-primary cursor-pointer transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </div>
                    </PermissionGate>
                    <PermissionGate permission={PERMISSIONS.DELETE_ROLES}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          openDelete(role);
                        }}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-text-secondary-light hover:text-red-600 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </div>
                    </PermissionGate>
                  </div>
                </button>
              );
            })}

            {roles.length === 0 && (
              <div className="p-8 text-center text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Belum ada role
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Permissions Matrix ── */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-4">
          {activeRole ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">
                  Permissions {activeRole.name}
                </h3>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden relative">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 text-text-secondary-light dark:text-text-secondary-dark uppercase font-semibold text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-4 min-w-[220px]">Feature</th>
                        {ACTIONS.map((action) => {
                          const Icon = ACTION_ICONS[action];
                          return (
                            <th
                              key={action}
                              className="px-4 py-4 text-center w-20"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <Icon className="w-4 h-4" />
                                <span className="capitalize">{action}</span>
                              </div>
                            </th>
                          );
                        })}
                        {/* Extra column header */}
                        <th className="px-4 py-4 text-center min-w-[120px]">
                          Extra
                        </th>
                        <th className="px-4 py-4 text-center w-24">All</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {PERMISSION_GROUPS.map((group) => {
                        const allPerms = [
                          ...ACTIONS.map((a) => group.permissions[a]).filter(
                            Boolean,
                          ),
                          ...(group.permissions.extra?.map((e) => e.value) ??
                            []),
                        ];
                        const hasAll = allPerms.every((p) =>
                          currentPermissions.has(p),
                        );

                        return (
                          <tr
                            key={group.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            {/* Feature */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${group.bg} ${group.color}`}
                                >
                                  <group.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-bold text-text-primary-light dark:text-text-primary-dark">
                                    {group.label}
                                  </p>
                                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                    {group.desc}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* CRUD checkboxes */}
                            {ACTIONS.map((action) => {
                              const permValue = group.permissions[action];
                              return (
                                <td
                                  key={action}
                                  className="px-4 py-4 text-center"
                                >
                                  {permValue ? (
                                    <input
                                      type="checkbox"
                                      checked={currentPermissions.has(
                                        permValue,
                                      )}
                                      onChange={() =>
                                        togglePermission(permValue)
                                      }
                                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-surface-dark dark:border-gray-600 cursor-pointer"
                                    />
                                  ) : (
                                    <span className="text-gray-300 dark:text-gray-700">
                                      —
                                    </span>
                                  )}
                                </td>
                              );
                            })}

                            {/* Extra permissions */}
                            <td className="px-4 py-4">
                              {group.permissions.extra?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {group.permissions.extra.map((extra) => (
                                    <label
                                      key={extra.value}
                                      className="flex items-center gap-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={currentPermissions.has(
                                          extra.value,
                                        )}
                                        onChange={() =>
                                          togglePermission(extra.value)
                                        }
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                      />
                                      {extra.label}
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-300 dark:text-gray-700 text-xs">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Toggle All */}
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => toggleGroupAll(group)}
                                className="text-primary text-xs font-bold hover:underline whitespace-nowrap"
                              >
                                {hasAll ? "Deselect" : "Select All"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Save Footer */}
                {isMatrixModified && (
                  <div className="p-4 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 sticky bottom-0 animate-in slide-in-from-bottom-2">
                    <button
                      onClick={handleDiscardMatrix}
                      className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-text-secondary-light dark:text-text-secondary-dark font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveMatrix}
                      className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-text-secondary-light dark:text-text-secondary-dark border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800 bg-surface-light/50 dark:bg-surface-dark/50">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">
                Belum Ada Role Dipilih
              </p>
              <p className="text-sm mt-1">
                Pilih role dari sidebar untuk melihat dan mengubah permissions.
              </p>
            </div>
          )}
        </div>
      </div>

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        onSubmit={handleSaveRoleInfo}
      />

      <RoleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        role={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
