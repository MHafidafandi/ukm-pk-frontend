import { User } from "@/contexts/AuthContext";

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

  onSubmit,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Anggota" : "Tambah Anggota"}
          </DialogTitle>

          <DialogDescription>
            {isEdit ? "Perbarui informasi anggota." : "Isi data anggota baru."}
          </DialogDescription>
        </DialogHeader>

        {/* ================= FORM ================= */}

        <div className="grid gap-4 py-2">
          {/* Name */}

          <div className="grid gap-2">
            <Label>Nama Lengkap *</Label>
            <Input
              value={form.nama}
              onChange={(e) =>
                setForm({
                  ...form,
                  nama: e.target.value,
                })
              }
              placeholder="Nama lengkap"
            />
          </div>

          {/* Email */}

          <div className="grid gap-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              placeholder="mail@example.com"
            />
          </div>

          {/* Angkatan + Phone */}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Angkatan</Label>
              <Input
                value={form.angkatan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    angkatan: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="2024"
              />
            </div>

            <div className="grid gap-2">
              <Label>No. Telepon</Label>
              <Input
                value={form.nomor_telepon}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nomor_telepon: e.target.value,
                  })
                }
                placeholder="08xxxxxx"
              />
            </div>
          </div>

          {/* Division + Role */}

          <div className="grid grid-cols-2 gap-4">
            {/* Division */}

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
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    division_id: v,
                  })
                }
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
            </div>

            {/* Role */}

            <div className="grid gap-2">
              <Label>Role</Label>
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  Gunakan menu "Kelola Role" di tabel untuk mengubah role.
                </p>
              )}

              <Select
                disabled={isEdit}
                value={form.role_ids[0]}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    role_ids: [v],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}

          <div className="grid gap-2">
            <Label>Status</Label>

            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  status: v as User["status"],
                })
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

        {/* ================= FOOTER ================= */}

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
