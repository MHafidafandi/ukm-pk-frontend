import { Role, User } from "@/features/auth/contexts/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateUserInput } from "@/lib/validations/users-schema";

/* ================= TYPES ================= */

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: Omit<CreateUserInput, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<CreateUserInput, "id">>>;
  divisions: { id: string; nama: string }[];
  roles: Role[];
  errors: Record<string, string>;
  onSubmit: () => void;
};

/* ================= COMPONENT ================= */

export const UserFormDialog = ({
  open,
  onOpenChange,
  isEdit,
  form,
  setForm,
  divisions,
  roles,
  errors,
  onSubmit,
}: Props) => {
  const update = (field: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...field }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Anggota" : "Tambah Anggota"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui informasi anggota." : "Isi data anggota baru."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Nama */}
          <div className="grid gap-2">
            <Label>Nama Lengkap *</Label>
            <Input
              value={form.nama}
              onChange={(e) => update({ nama: e.target.value })}
              placeholder="Nama lengkap"
              className={errors.nama ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.nama && <span className="text-xs text-red-500">{errors.nama}</span>}
          </div>

          {/* Username */}
          <div className="grid gap-2">
            <Label>Username *</Label>
            <Input
              value={form.username}
              onChange={(e) => update({ username: e.target.value })}
              placeholder="username"
              className={errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.username && <span className="text-xs text-red-500">{errors.username}</span>}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="mail@example.com"
              className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
          </div>

          {/* Password — hanya saat tambah */}
          {!isEdit && (
            <div className="grid gap-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update({ password: e.target.value })}
                placeholder="••••••••"
                className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
            </div>
          )}

          {/* Angkatan + No. Telepon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Angkatan</Label>
              <Input
                type="number"
                value={form.angkatan}
                onChange={(e) =>
                  update({ angkatan: parseInt(e.target.value) || 0 })
                }
                placeholder="2024"
                className={errors.angkatan ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.angkatan && <span className="text-xs text-red-500">{errors.angkatan}</span>}
            </div>

            <div className="grid gap-2">
              <Label>No. Telepon</Label>
              <Input
                value={form.nomor_telepon}
                onChange={(e) => update({ nomor_telepon: e.target.value })}
                placeholder="+628xxxxxx"
                className={errors.nomor_telepon ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.nomor_telepon && <span className="text-xs text-red-500">{errors.nomor_telepon}</span>}
            </div>
          </div>

          {/* Alamat */}
          <div className="grid gap-2">
            <Label>Alamat</Label>
            <Input
              value={form.alamat}
              onChange={(e) => update({ alamat: e.target.value })}
              placeholder="Alamat lengkap"
              className={errors.alamat ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.alamat && <span className="text-xs text-red-500">{errors.alamat}</span>}
          </div>

          {/* Divisi + Role */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Divisi</Label>
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  Gunakan menu "Pindah Divisi" di tabel untuk mengubah divisi.
                </p>
              )}
              <Select
                disabled={isEdit}
                value={form.division_id}
                onValueChange={(v) => update({ division_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih divisi" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.division_id && <span className="text-xs text-red-500">{errors.division_id}</span>}
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  Gunakan menu "Kelola Role" di tabel untuk mengubah role.
                </p>
              )}
              <Select
                disabled={isEdit}
                value={form.role_ids?.[0] ?? ""}
                onValueChange={(v) => update({ role_ids: [v] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role_ids && <span className="text-xs text-red-500">{errors.role_ids}</span>}
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => update({ status: v as User["status"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSubmit}>{isEdit ? "Simpan" : "Tambah"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
