/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Spinner } from "@/components/ui/spinner";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { User } from "@/contexts/AuthContext";
import {
  useUsers,
  useUsersStats,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
  useMarkAsAlumniUser,
} from "../hooks/useUsers";
import {
  CreateUserInput,
  CreateUserSchema,
  updateUserRequestSchema,
} from "@/lib/validations/users-schema";
import { UsersStats } from "./user-stats";
import { UsersFilters } from "./user-filters";
import { useDivisions } from "@/features/divisions/hooks/useDivisions";
import { UsersTable } from "./user-table";
import { UserFormDialog } from "./user-form-dialog";
import { UserDeleteDialog } from "./user-delete-dialog";
import { UserRoleDialog } from "./user-role-dialog";
import { UserDivisionDialog } from "./user-division-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";

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
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDivision, setFilterDivision] = useState<string>("");
  const [filterAngkatan, setFilterAngkatan] = useState<number | undefined>(
    undefined,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [divisionOpen, setDivisionOpen] = useState(false);

  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [managingRole, setManagingRole] = useState<User | null>(null);
  const [assigningDivision, setAssigningDivision] = useState<User | null>(null);

  const [form, setForm] = useState(emptyForm);

  const usersQuery = useUsers({
    page: currentPage,
    limit: pageSize,
    search: search || undefined,
    status: filterStatus || undefined,
    division_id: filterDivision || undefined,
    angkatan: filterAngkatan,
  });
  const statsQuery = useUsersStats();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const activate = useActivateUser();
  const deactivate = useDeactivateUser();
  const alumni = useMarkAsAlumniUser();
  const divisionsQuery = useDivisions();
  const divisions = divisionsQuery.data?.data.map((d) => ({
    id: d.id,
    nama: d.nama_divisi,
  }));

  const users = usersQuery.data?.data.users ?? [];
  const pagination = usersQuery.data?.data.pagination;
  const totalPages = pagination?.total_pages ?? 1;
  const totalData = pagination?.total ?? 0;

  const stats = useMemo(() => {
    const s = statsQuery.data?.data;

    return {
      total: s?.total_users ?? 0,
      active: s?.active_users ?? 0,
      inactive: s?.inactive_users ?? 0,
      alumni: s?.alumni_users ?? 0,
    };
  }, [statsQuery.data]);

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

      nomor_telepon: user.nomor_telepon,
      alamat: user.alamat,

      angkatan: Number(user.angkatan),

      status:
        user.status === "aktif"
          ? "aktif"
          : user.status === "nonaktif"
            ? "nonaktif"
            : "alumni",

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
        await updateUser.mutateAsync({
          id: editing.id,
          data: parsed,
        });

        toast.success("User berhasil diperbarui");
      } else {
        // CREATE
        const parsed = CreateUserSchema.parse(payload);
        await createUser.mutateAsync(parsed);

        toast.success("User berhasil ditambahkan");
      }

      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);

      usersQuery.refetch();
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }

      toast.error("Gagal menyimpan user");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await deleteUser.mutateAsync(deleting.id);
      toast.success("User dihapus");

      setDeleteOpen(false);
      usersQuery.refetch();
    } catch (err: any) {
      toast.error(err.response?.error || "Gagal menghapus user");
    }
  };

  const handleStatusChange = async (user: User, status: User["status"]) => {
    try {
      if (status === "aktif") {
        await activate.mutateAsync(user.id);
      }

      if (status === "nonaktif") {
        await deactivate.mutateAsync(user.id);
      }

      if (status === "alumni") {
        await alumni.mutateAsync(user.id);
      }

      toast.success("Status diperbarui");

      usersQuery.refetch();
    } catch {
      toast.error("Gagal update status");
    }
  };
  if (usersQuery.isLoading || statsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Manajemen Anggota
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola data anggota UKM Peduli Kemanusiaan
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.CREATE_USERS}>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Anggota
          </Button>
        </PermissionGate>
      </div>

      {/* Stats */}
      <UsersStats stats={stats} />

      {/* Filters */}
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

      {/* Table */}
      <UsersTable
        users={users}
        currentPage={currentPage}
        pageSize={pageSize}
        pagination={pagination}
        onEdit={openEdit}
        onDelete={openDelete}
        onStatusChange={handleStatusChange}
        onPageChange={setCurrentPage}
        onAssignDivision={openAssignDivision}
        onManageRoles={openManageRoles}
      />

      {/* Add/Edit Dialog */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isEdit={!!editing}
        form={form}
        setForm={setForm}
        divisions={divisions ?? []}
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
      />

      <UserDivisionDialog
        open={divisionOpen}
        onOpenChange={setDivisionOpen}
        user={assigningDivision}
      />
    </div>
  );
};
