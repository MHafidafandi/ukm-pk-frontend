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
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useRoleContext } from "@/features/roles/contexts/RoleContext";
import { Role } from "@/features/roles/services/roleService";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

type CreateRoleInput = z.infer<typeof createRoleSchema>;

import { RoleFormDialog } from "./role-form-dialog";
import { RoleDeleteDialog } from "./role-delete-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

const emptyForm: CreateRoleInput = {
  name: "",
  description: "",
  permissions: [],
};

// Mock structure for Permissions Matrix
const PERMISSION_GROUPS = [
  {
    id: "users",
    label: "User Management",
    desc: "Accounts, profiles, roles",
    icon: Users,
    color: "text-primary",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    id: "assets",
    label: "Assets Inventory",
    desc: "Manage organization items",
    icon: Box,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: "donations",
    label: "Donations",
    desc: "Incoming funds and donors",
    icon: Heart,
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    id: "settings",
    label: "System Settings",
    desc: "Global configuration",
    icon: Settings,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
];

const ACTIONS = ["view", "create", "update", "delete"] as const;

export const RolesList = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editing, setEditing] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const [form, setForm] = useState<CreateRoleInput>(emptyForm);

  // Selected role for the matrix
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  // Current edited permissions state
  const [currentPermissions, setCurrentPermissions] = useState<Set<string>>(
    new Set(),
  );
  const [isMatrixModified, setIsMatrixModified] = useState(false);

  const { roles, createRole, updateRole, deleteRole, isFetchingRoles } =
    useRoleContext();

  // Set default active role when roles load
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
    setForm({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
    });
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
      if (activeRole?.id === deleting.id) {
        setActiveRole(null);
      }
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus role");
    }
  };

  // Matrix logic
  const togglePermission = (group: string, action: string) => {
    const permString = group + ":" + action;
    const next = new Set(currentPermissions);
    if (next.has(permString)) {
      next.delete(permString);
    } else {
      next.add(permString);
    }
    setCurrentPermissions(next);
    setIsMatrixModified(true);
  };

  const toggleGroupPermissions = (group: string) => {
    const next = new Set(currentPermissions);
    const hasAll = ACTIONS.every((a) => next.has(group + ":" + a));

    ACTIONS.forEach((action) => {
      const p = group + ":" + action;
      if (hasAll) next.delete(p);
      else next.add(p);
    });

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
          description: activeRole.description, // Ensure description is also passed
          permissions: Array.from(currentPermissions),
        },
      });
      // Update the activeRole in state with new permissions
      setActiveRole((prev) =>
        prev ? { ...prev, permissions: Array.from(currentPermissions) } : null,
      );
      toast.success("Permissions saved successfully!");
      setIsMatrixModified(false);
    } catch (err) {
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
        {/* Left Column: Roles List */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Roles
            </h3>
            <PermissionGate permission={PERMISSIONS.CREATE_ROLES}>
              <button
                onClick={openAdd}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </PermissionGate>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            {roles.map((role, idx) => {
              const isActive = activeRole?.id === role.id;

              const btnClass =
                "flex items-center justify-between p-4 border-l-4 transition-colors w-full text-left group " +
                (isActive
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50") +
                (idx !== roles.length - 1
                  ? " border-b border-gray-100 dark:border-gray-800"
                  : "");

              const titleClass =
                "text-sm font-bold " +
                (isActive
                  ? "text-primary dark:text-primary-light"
                  : "text-text-primary-light dark:text-text-primary-dark");

              const actionClass =
                "flex gap-1 shrink-0 transition-opacity " +
                (isActive
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100");

              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={btnClass}
                >
                  <div className="flex flex-col pr-4">
                    <span className={titleClass}>{role.name}</span>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 line-clamp-1">
                      {role.description || "No description provided"}
                    </span>
                  </div>
                  <div className={actionClass}>
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
                No roles found
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Permissions Matrix */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-4">
          {activeRole ? (
            <>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 text-text-primary-light dark:text-text-primary-dark">
                    {activeRole.name}
                    <span className="text-text-secondary-light text-base font-normal ml-2">
                      Permissions Matrix
                    </span>
                  </h3>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col flex-1 overflow-hidden relative">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 text-text-secondary-light dark:text-text-secondary-dark uppercase font-semibold text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-4 min-w-[200px]" scope="col">
                          Feature
                        </th>
                        <th className="px-6 py-4 text-center w-24" scope="col">
                          <div className="flex flex-col items-center gap-1">
                            <Eye className="w-5 h-5" />
                            <span>View</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center w-24" scope="col">
                          <div className="flex flex-col items-center gap-1">
                            <PlusCircle className="w-5 h-5" />
                            <span>Create</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center w-24" scope="col">
                          <div className="flex flex-col items-center gap-1">
                            <Edit3 className="w-5 h-5" />
                            <span>Update</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center w-24" scope="col">
                          <div className="flex flex-col items-center gap-1">
                            <Trash2 className="w-5 h-5" />
                            <span>Delete</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center w-24" scope="col">
                          <span className="sr-only">Toggle All</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {PERMISSION_GROUPS.map((group) => {
                        const allSelected = ACTIONS.every((a) =>
                          currentPermissions.has(group.id + ":" + a),
                        );

                        return (
                          <tr
                            key={group.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={
                                    "p-2 rounded-lg " +
                                    group.bg +
                                    " " +
                                    group.color
                                  }
                                >
                                  <group.icon className="w-5 h-5" />
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
                            {ACTIONS.map((action) => (
                              <td
                                key={action}
                                className="px-6 py-4 text-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={currentPermissions.has(
                                    group.id + ":" + action,
                                  )}
                                  onChange={() =>
                                    togglePermission(group.id, action)
                                  }
                                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary dark:bg-surface-dark dark:border-gray-600 cursor-pointer"
                                />
                              </td>
                            ))}
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => toggleGroupPermissions(group.id)}
                                className="text-primary text-xs font-bold hover:underline"
                              >
                                {allSelected ? "Deselect All" : "Select All"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Save Actions Footer */}
                {isMatrixModified && (
                  <div className="p-4 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 sticky bottom-0 mt-auto animate-in slide-in-from-bottom-2">
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
                No Role Selected
              </p>
              <p className="text-sm mt-1">
                Select a role from the sidebar to view and modify its
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
    </div>
  );
};
