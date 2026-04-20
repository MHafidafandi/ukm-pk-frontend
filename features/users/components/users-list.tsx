/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

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
    sort,
    setSort,
    order,
    setOrder,
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      nama: user.nama,
      username: user.username,
      email: user.email,
      password: "",
      nomor_telepon: user.nomor_telepon ?? "+62",
      alamat: user.alamat ?? "",
      angkatan: Number(user.angkatan),
      status: user.status,
      division_id: user.division?.id ?? "",
      role_ids: user.roles?.map((r) => r.id) ?? [],
    });
    setFormErrors({});
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
      const payload = editing ? { ...form, password: undefined } : form;

      if (editing) {
        const parsed = updateUserRequestSchema.parse(payload);
        await updateUser({ id: editing.id, data: parsed });
        toast.success("User berhasil diperbarui");
      } else {
        const parsed = CreateUserSchema.parse(payload);
        await createUser(parsed);
        toast.success("User berhasil ditambahkan");
      }

      setEditing(null);
      setForm(emptyForm);
      setFormErrors({});
      setFormOpen(false);
    } catch (err: any) {
      if (err.name === "ZodError") {
        const fieldErrors: Record<string, string> = {};
        const issues = err.errors || err.issues || [];
        issues.forEach((issue: any) => {
          if (issue.path && issue.path.length > 0) {
            fieldErrors[issue.path[0]] = issue.message;
          }
        });
        setFormErrors(fieldErrors);
        toast.error("Mohon periksa kembali isian form");
        return;
      }
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Gagal menyimpan user",
      );
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
      if (status === "aktif") await activate(user.id);
      if (status === "nonaktif") await deactivate(user.id);
      if (status === "alumni") await alumni(user.id);
      toast.success("Status diperbarui");
    } catch {
      toast.error("Gagal update status");
    }
  };

  return (
    <>
      {/* ── Page Header ── */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Manrope'] text-3xl font-bold text-on-surface tracking-tight">
            Manajemen Anggota
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola data anggota, peran, dan divisi UKM Peduli Kemanusiaan.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_USERS}>
          <button
            onClick={openAdd}
            className="bg-primary-gradient text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-ambient hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Anggota
          </button>
        </PermissionGate>
      </header>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <UsersStats stats={stats} />
      </div>

      {/* ── Table Card ── */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden mb-8">
        <UsersFilters
          division={filterDivision}
          angkatan={filterAngkatan}
          search={search}
          status={filterStatus}
          sort={sort}
          order={order}
          onDivisionChange={setFilterDivision}
          onAngkatanChange={setFilterAngkatan}
          onSearch={setSearch}
          onStatusChange={setFilterStatus}
          onSortChange={setSort}
          onOrderChange={setOrder}
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

      {/* ── Mobile FAB ── */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <PermissionGate permission={PERMISSIONS.CREATE_USERS}>
          <button
            onClick={openAdd}
            className="bg-primary text-on-primary rounded-full p-4 shadow-float flex items-center justify-center transition-all active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </button>
        </PermissionGate>
      </div>

      {/* ── Dialogs ── */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setFormErrors({});
        }}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        errors={formErrors}
        onSubmit={handleSave}
      />

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
      />

      <UserDivisionDialog
        open={divisionOpen}
        onOpenChange={setDivisionOpen}
        user={assigningDivision}
      />
    </>
  );
};
