"use client";

import { Spinner } from "@/components/ui/spinner";
import { useState, useCallback } from "react";
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

const emptyForm: CreateRoleInput = { name: "", permissions: [] };

const PERMISSION_GROUPS = [
  {
    id: "users",
    label: "User Management",
    desc: "Akun, profil, dan role",
    icon: Users,
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
    permissions: {
      view: PERMISSIONS.VIEW_ROLES,
      create: PERMISSIONS.CREATE_ROLES,
      update: PERMISSIONS.EDIT_ROLES,
      delete: PERMISSIONS.DELETE_ROLES,
      extra: [{ label: "Manage Perms", value: PERMISSIONS.MANAGE_PERMISSIONS }],
    },
  },
  {
    id: "divisions",
    label: "Division Management",
    desc: "Divisi organisasi",
    icon: LayoutGrid,
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
    permissions: {
      view: PERMISSIONS.VIEW_DOCUMENTATIONS,
      create: PERMISSIONS.CREATE_DOCUMENTATIONS,
      update: PERMISSIONS.EDIT_DOCUMENTATIONS,
      delete: PERMISSIONS.DELETE_DOCUMENTATIONS,
      extra: [
        { label: "View Admin", value: PERMISSIONS.VIEW_ALL_DOCUMENTATIONS },
        { label: "Archive", value: PERMISSIONS.ARCHIVE_DOCUMENTATIONS },
      ],
    },
  },
  {
    id: "lpj",
    label: "LPJ",
    desc: "Laporan pertanggungjawaban",
    icon: BookOpen,
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

  const { roles, stats, createRole, updateRole, deleteRole, isFetchingRoles } =
    useRoleContext();

  const handleSelectRole = useCallback((role: Role) => {
    setActiveRole(role);
    setCurrentPermissions(new Set(role.permissions || []));
    setIsMatrixModified(false);
  }, []);

  if (roles.length > 0 && !activeRole) handleSelectRole(roles[0]);

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
        if (activeRole?.id === editing.id)
          setActiveRole((prev) => (prev ? { ...prev, ...parsed } : null));
      } else {
        await createRole(parsed);
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: unknown) {
      const errObj = err as Record<string, unknown>;
      if (errObj?.name === "ZodError" && "errors" in errObj) {
        toast.error(
          (errObj.errors as Array<{ message: string }>)[0]?.message ||
            "Validasi gagal",
        );
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
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err.response as { error?: string }).error || "Gagal menghapus role"
          : "Gagal menghapus role";
      toast.error(errorMsg);
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

  const statsCards = stats?.data
    ? [
        {
          label: "Total Roles",
          value: stats.data.total_roles ?? 0,
          icon: Shield,
        },
        {
          label: "Most Popular",
          value: stats.data.most_popular?.role_name ?? "—",
          sub: `${stats.data.most_popular?.user_count ?? 0} users`,
          icon: Users,
        },
        {
          label: "Unassigned Roles",
          value: stats.data.unassigned_roles?.length ?? 0,
          icon: Settings,
        },
      ]
    : [];

  return (
    <>
      {/* ── Page Header ── */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Manrope'] text-3xl font-bold text-on-surface tracking-tight">
            Role & Permissions
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Atur level akses untuk setiap anggota organisasi.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_ROLES}>
          <button
            onClick={openAdd}
            className="bg-primary-gradient text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-ambient hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Role
          </button>
        </PermissionGate>
      </header>

      {/* ── Stats ── */}
      {statsCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-surface-container-lowest rounded-2xl p-6 flex items-center gap-4 shadow-ambient"
              >
                <div className="h-12 w-12 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-on-secondary-container" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">
                    {card.label}
                  </p>
                  <p className="font-['Manrope'] text-2xl font-bold text-on-surface">
                    {card.value}
                  </p>
                  {card.sub && (
                    <p className="text-xs text-on-surface-variant">
                      {card.sub}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Split Layout ── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Left: Role List ── */}
        <div className="w-full md:w-72 flex-shrink-0">
          <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 bg-surface-container-low flex items-center justify-between">
              <h3 className="font-['Manrope'] text-base font-bold text-primary">
                Organizational Roles
              </h3>
            </div>

            {/* Role items */}
            <div className="divide-y divide-outline-variant/10">
              {roles.map((role) => {
                const isActive = activeRole?.id === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all group ${
                      isActive
                        ? "bg-primary/5 border-l-4 border-primary"
                        : "hover:bg-surface border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span
                        className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-on-surface"}`}
                      >
                        {role.name}
                      </span>
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {role.user_count ?? 0} user
                      </span>
                    </div>

                    <div
                      className={`flex gap-1 flex-shrink-0 ml-2 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                      <PermissionGate permission={PERMISSIONS.EDIT_ROLES}>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(role);
                          }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary cursor-pointer transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </div>
                      </PermissionGate>
                      <PermissionGate permission={PERMISSIONS.DELETE_ROLES}>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            openDelete(role);
                          }}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-on-surface-variant hover:text-destructive cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </div>
                      </PermissionGate>
                    </div>
                  </button>
                );
              })}

              {roles.length === 0 && (
                <div className="p-8 text-center text-sm text-on-surface-variant">
                  Belum ada role
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Permission Matrix ── */}
        <div className="flex-1 min-w-0">
          {activeRole ? (
            <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden">
              {/* Matrix header */}
              <div className="px-6 py-5 bg-primary flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-fixed mb-1">
                    Permissions Editor
                  </p>
                  <h4 className="font-['Manrope'] text-xl font-bold text-on-primary">
                    {activeRole.name}
                  </h4>
                </div>
                <Shield className="h-6 w-6 text-primary-fixed opacity-60" />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant min-w-[200px]">
                        Fitur
                      </th>
                      {ACTIONS.map((action) => {
                        const Icon = ACTION_ICONS[action];
                        return (
                          <th
                            key={action}
                            className="px-4 py-4 text-center w-20"
                          >
                            <div className="flex flex-col items-center gap-1 text-on-surface-variant">
                              <Icon className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest capitalize">
                                {action}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                      <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant min-w-[120px]">
                        Extra
                      </th>
                      <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant w-24">
                        All
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {PERMISSION_GROUPS.map((group) => {
                      const allPerms = [
                        ...ACTIONS.map((a) => group.permissions[a]).filter(
                          Boolean,
                        ),
                        ...(group.permissions.extra?.map((e) => e.value) ?? []),
                      ];
                      const hasAll = allPerms.every((p) =>
                        currentPermissions.has(p),
                      );
                      const Icon = group.icon;

                      return (
                        <tr
                          key={group.id}
                          className="hover:bg-surface transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-secondary-container flex-shrink-0">
                                <Icon className="h-4 w-4 text-on-secondary-container" />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-on-surface">
                                  {group.label}
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                  {group.desc}
                                </p>
                              </div>
                            </div>
                          </td>

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
                                    checked={currentPermissions.has(permValue)}
                                    onChange={() => togglePermission(permValue)}
                                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                                  />
                                ) : (
                                  <span className="text-on-surface-variant/30 text-xs">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}

                          <td className="px-4 py-4">
                            {group.permissions.extra?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {group.permissions.extra.map((extra) => (
                                  <label
                                    key={extra.value}
                                    className="flex items-center gap-1.5 text-xs text-on-surface-variant cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={currentPermissions.has(
                                        extra.value,
                                      )}
                                      onChange={() =>
                                        togglePermission(extra.value)
                                      }
                                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                                    />
                                    {extra.label}
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <span className="text-on-surface-variant/30 text-xs">
                                —
                              </span>
                            )}
                          </td>

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

              {/* Save bar */}
              {isMatrixModified && (
                <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 flex justify-end gap-3 sticky bottom-0">
                  <button
                    onClick={handleDiscardMatrix}
                    className="px-5 py-2.5 text-sm font-medium text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveMatrix}
                    className="font-bold px-6 py-2.5 text-sm text-on-primary bg-primary-gradient rounded-xl shadow-ambient hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl shadow-ambient text-center">
              <div className="h-16 w-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-on-surface-variant" />
              </div>
              <p className="font-['Manrope'] font-bold text-lg text-on-surface">
                Belum Ada Role Dipilih
              </p>
              <p className="text-sm text-on-surface-variant mt-1">
                Pilih role dari panel kiri untuk melihat dan mengubah
                permissions.
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
    </>
  );
};
