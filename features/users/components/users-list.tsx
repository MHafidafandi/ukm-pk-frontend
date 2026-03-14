/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Spinner } from "@/components/ui/spinner";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { User } from "@/features/auth/contexts/AuthContext";
import { useUserContext } from "@/features/users/contexts/UserContext";
import {
  CreateUserInput,
  CreateUserSchema,
  updateUserRequestSchema,
} from "@/lib/validations/users-schema";
import { UsersStats } from "./user-stats";
import { UsersFilters } from "./user-filters";
import { useDivisionContext } from "@/features/divisions/contexts/DivisionContext";
import { UsersTable } from "./user-table";
import { UserFormDialog } from "./user-form-dialog";
import { UserDeleteDialog } from "./user-delete-dialog";
import { UserRoleDialog } from "./user-role-dialog";
import { UserDivisionDialog } from "./user-division-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { useRoleContext } from "@/features/roles/contexts/RoleContext";

const emptyForm: CreateUserInput = {
  nama: "",
  username: "",
  email: "",
  password: "",
  nomor_telepon: "+62",
  alamat: "",
  angkatan: new Date().getFullYear(),

  status: "aktif",

  division_id: "",
  role_ids: [],
};

export const UsersList = () => {
  const {
    users,
    pagination,
    stats: statsData,
    search,
    setSearch,
    page: currentPage,
    setPage: setCurrentPage,
    limit: pageSize,
    statusFilter: filterStatus,
    setStatusFilter: setFilterStatus,
    divisionFilter: filterDivision,
    setDivisionFilter: setFilterDivision,
    angkatanFilter: filterAngkatan,
    setAngkatanFilter: setFilterAngkatan,

    createUser,
    updateUser,
    deleteUser,
    activateUser: activate,
    deactivateUser: deactivate,
    markAsAlumniUser: alumni,
  } = useUserContext();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [divisionOpen, setDivisionOpen] = useState(false);

  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [managingRole, setManagingRole] = useState<User | null>(null);
  const [assigningDivision, setAssigningDivision] = useState<User | null>(null);

  const [form, setForm] = useState(emptyForm);

  const { divisions: rawDivisions } = useDivisionContext();
  const { roles: rawRoles } = useRoleContext();
  const roles = rawRoles;
  const divisions = rawDivisions.map((d: any) => ({
    id: d.id,
    nama: d.nama_divisi,
  }));

  const stats = useMemo(() => {
    const s = statsData;

    return {
      total: s?.total_users ?? 0,
      active: s?.active_users ?? 0,
      inactive: s?.inactive_users ?? 0,
      alumni: s?.alumni_users ?? 0,
    };
  }, [statsData]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);

    setForm({
      nama: user.nama, // mapping
      username: user.username,
      email: user.email,
      password: "", // kosong pas edit
      nomor_telepon: user.nomor_telepon ?? "+62",
      alamat: user.alamat ?? "",
      angkatan: Number(user.angkatan),
      status: user.status,
      division_id: user.division?.id ?? "",
      role_ids: user.roles?.map((r) => r.id) ?? [],
    });

    setFormOpen(true);
  };

  const openDelete = (user: User) => {
    setDeleting(user);
    setDeleteOpen(true);
  };

  const openManageRoles = (user: User) => {
    setManagingRole(user);
    setRoleOpen(true);
  };

  const openAssignDivision = (user: User) => {
    setAssigningDivision(user);
    setDivisionOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = editing
        ? {
          ...form,
          password: undefined, // hapus password saat edit
        }
        : form;

      if (editing) {
        // UPDATE
        const parsed = updateUserRequestSchema.parse(payload);
        await updateUser({
          id: editing.id,
          data: parsed,
        });

        toast.success("User berhasil diperbarui");
      } else {
        // CREATE
        const parsed = CreateUserSchema.parse(payload);
        await createUser(parsed);

        toast.success("User berhasil ditambahkan");
      }

      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      if (err.name === "ZodError") {
        console.error(err.message);
        return;
      }

      console.error("Gagal menyimpan user");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteUser(deleting.id);
      toast.success("User dihapus");

      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus user");
    }
  };

  const handleStatusChange = async (user: User, status: User["status"]) => {
    try {
      if (status === "aktif") {
        await activate(user.id);
      }

      if (status === "nonaktif") {
        await deactivate(user.id);
      }

      if (status === "alumni") {
        await alumni(user.id);
      }

      toast.success("Status diperbarui");
    } catch {
      toast.error("Gagal update status");
    }
  };

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Manajemen Anggota
          </h1>
          <p className="text-sm text-subtext-light dark:text-subtext-dark mt-1">
            Kelola data anggota, peran, dan divisi UKM Peduli Kemanusiaan.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <PermissionGate permission={PERMISSIONS.CREATE_USERS}>
            <button
              onClick={openAdd}
              className="bg-primary hover:bg-primary/80 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Tambah Anggota
            </button>
          </PermissionGate>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <UsersStats stats={stats} />
      </div>

      {/* Filters & Table */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft border border-border-light dark:border-border-dark overflow-hidden mb-8">
        <UsersFilters
          division={filterDivision}
          angkatan={filterAngkatan}
          search={search}
          status={filterStatus}
          onDivisionChange={setFilterDivision}
          onAngkatanChange={setFilterAngkatan}
          onSearch={setSearch}
          onStatusChange={setFilterStatus}
        />
        <div className="overflow-x-auto">
          <UsersTable
            users={users}
            currentPage={currentPage}
            pageSize={pageSize}
            pagination={pagination || undefined}
            onEdit={openEdit}
            onDelete={openDelete}
            onStatusChange={handleStatusChange}
            onPageChange={setCurrentPage}
            onAssignDivision={openAssignDivision}
            onManageRoles={openManageRoles}
          />
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <PermissionGate permission={PERMISSIONS.CREATE_USERS}>
          <button
            onClick={openAdd}
            className="bg-primary hover:bg-purple-700 text-white rounded-full p-4 shadow-lg shadow-purple-500/40 flex items-center justify-center transition-all active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </button>
        </PermissionGate>
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        divisions={divisions ?? []}
        roles={roles ?? []}
        onSubmit={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <UserDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={deleting}
        onConfirm={handleDelete}
      />

      <UserRoleDialog
        open={roleOpen}
        onOpenChange={setRoleOpen}
        user={managingRole}
        roles={roles ?? []}
      />

      <UserDivisionDialog
        open={divisionOpen}
        onOpenChange={setDivisionOpen}
        user={assigningDivision}
        divisions={divisions}
      />
    </>
  );
};
