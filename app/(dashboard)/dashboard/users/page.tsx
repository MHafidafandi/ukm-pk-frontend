"use client";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
export interface MemberData {
  id: string;
  name: string;
  email: string;
  angkatan: string;
  division: string;
  role: string;
  status: "active" | "inactive" | "alumni";
  phone: string;
}
export const mockMembers: MemberData[] = [
  {
    id: "1",
    name: "Ahmad Fauzi",
    email: "ahmad@mail.com",
    angkatan: "2022",
    division: "Ketua Umum",
    role: "super_admin",
    status: "active",
    phone: "08123456789",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti@mail.com",
    angkatan: "2023",
    division: "Divisi Sosial",
    role: "member",
    status: "active",
    phone: "08234567890",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi@mail.com",
    angkatan: "2023",
    division: "Divisi Pendidikan",
    role: "member",
    status: "active",
    phone: "08345678901",
  },
  {
    id: "4",
    name: "Dewi Lestari",
    email: "dewi@mail.com",
    angkatan: "2022",
    division: "Divisi Humas",
    role: "administrator",
    status: "active",
    phone: "08456789012",
  },
  {
    id: "5",
    name: "Rizky Pratama",
    email: "rizky@mail.com",
    angkatan: "2021",
    division: "Divisi Dana",
    role: "member",
    status: "alumni",
    phone: "08567890123",
  },
  {
    id: "6",
    name: "Nur Aisyah",
    email: "nur@mail.com",
    angkatan: "2023",
    division: "Divisi Sosial",
    role: "member",
    status: "active",
    phone: "08678901234",
  },
  {
    id: "7",
    name: "Fajar Ramadhan",
    email: "fajar@mail.com",
    angkatan: "2022",
    division: "Divisi Pendidikan",
    role: "member",
    status: "inactive",
    phone: "08789012345",
  },
  {
    id: "8",
    name: "Maya Sari",
    email: "maya@mail.com",
    angkatan: "2024",
    division: "Divisi Humas",
    role: "member",
    status: "active",
    phone: "08890123456",
  },
];
const statusConfig: Record<
  MemberData["status"],
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  active: { label: "Aktif", variant: "default" },
  inactive: { label: "Nonaktif", variant: "secondary" },
  alumni: { label: "Alumni", variant: "outline" },
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  member: "Anggota",
  guest: "Tamu",
};

const divisions = [
  "Ketua Umum",
  "Divisi Sosial",
  "Divisi Pendidikan",
  "Divisi Humas",
  "Divisi Dana",
];

const emptyForm: Omit<MemberData, "id"> = {
  name: "",
  email: "",
  angkatan: "",
  division: "",
  role: "member",
  status: "active",
  phone: "",
};

const UserManagementPage = () => {
  const [members, setMembers] = useState<MemberData[]>(mockMembers);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDivision, setFilterDivision] = useState<string>("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);
  const [deletingMember, setDeletingMember] = useState<MemberData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || m.status === filterStatus;
      const matchDiv =
        filterDivision === "all" || m.division === filterDivision;
      return matchSearch && matchStatus && matchDiv;
    });
  }, [members, search, filterStatus, filterDivision]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const stats = useMemo(
    () => ({
      total: members.length,
      active: members.filter((m) => m.status === "active").length,
      inactive: members.filter((m) => m.status === "inactive").length,
      alumni: members.filter((m) => m.status === "alumni").length,
    }),
    [members],
  );

  const openAdd = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (member: MemberData) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      email: member.email,
      angkatan: member.angkatan,
      division: member.division,
      role: member.role,
      status: member.status,
      phone: member.phone,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast("Error", {
        description: "Nama dan email wajib diisi.",
      });
      return;
    }
    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? { ...m, ...form } : m)),
      );
      toast("Berhasil", {
        description: `Data ${form.name} berhasil diperbarui.`,
      });
    } else {
      const newMember: MemberData = { ...form, id: crypto.randomUUID() };
      setMembers((prev) => [...prev, newMember]);
      toast("Berhasil", {
        description: `${form.name} berhasil ditambahkan.`,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deletingMember) return;
    setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
    toast("Berhasil", {
      description: `${deletingMember.name} berhasil dihapus.`,
    });
    setDeleteDialogOpen(false);
    setDeletingMember(null);
  };

  const changeStatus = (member: MemberData, status: MemberData["status"]) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, status } : m)),
    );
    toast("Status Diperbarui", {
      description: `${member.name} sekarang berstatus ${statusConfig[status].label}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Manajemen Anggota
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola data anggota UKM Peduli
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Anggota
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {(
          [
            {
              label: "Total Anggota",
              value: stats.total,
              color: "text-primary",
            },
            { label: "Aktif", value: stats.active, color: "text-green-600" },
            {
              label: "Nonaktif",
              value: stats.inactive,
              color: "text-muted-foreground",
            },
            { label: "Alumni", value: stats.alumni, color: "text-orange-600" },
          ] as const
        ).map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterDivision}
              onValueChange={(value) => {
                setFilterDivision(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisions.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden md:table-cell">Angkatan</TableHead>
                <TableHead className="hidden sm:table-cell">Divisi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Role</TableHead>
                <TableHead className="hidden lg:table-cell">Kontak</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Tidak ada data anggota ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {member.angkatan}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {member.division}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[member.status].variant}>
                        {statusConfig[member.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {roleLabels[member.role] ?? member.role}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {member.phone}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(member)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {member.status !== "active" && (
                            <DropdownMenuItem
                              onClick={() => changeStatus(member, "active")}
                            >
                              <UserCheck className="mr-2 h-4 w-4" /> Aktifkan
                            </DropdownMenuItem>
                          )}
                          {member.status !== "inactive" && (
                            <DropdownMenuItem
                              onClick={() => changeStatus(member, "inactive")}
                            >
                              <UserX className="mr-2 h-4 w-4" /> Nonaktifkan
                            </DropdownMenuItem>
                          )}
                          {member.status !== "alumni" && (
                            <DropdownMenuItem
                              onClick={() => changeStatus(member, "alumni")}
                            >
                              <GraduationCap className="mr-2 h-4 w-4" /> Tandai
                              Alumni
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeletingMember(member);
                              setDeleteDialogOpen(true);
                            }}
                          >
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
          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Menampilkan{" "}
              {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filtered.length)} dari{" "}
              {filtered.length} anggota
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Anggota" : "Tambah Anggota Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Perbarui informasi anggota."
                : "Isi data untuk menambahkan anggota baru."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contoh@mail.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="angkatan">Angkatan</Label>
                <Input
                  id="angkatan"
                  value={form.angkatan}
                  onChange={(e) =>
                    setForm({ ...form, angkatan: e.target.value })
                  }
                  placeholder="2024"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Divisi</Label>
                <Select
                  value={form.division}
                  onValueChange={(v) => setForm({ ...form, division: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="member">Anggota</SelectItem>
                    <SelectItem value="guest">Tamu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as MemberData["status"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              {editingMember ? "Simpan Perubahan" : "Tambah Anggota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Anggota</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <strong>{deletingMember?.name}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
