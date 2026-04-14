import { Role, User } from "@/features/auth/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useDivisionsSelect, useRolesSelect } from "@/lib/services/selectService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: Omit<CreateUserInput, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<CreateUserInput, "id">>>;
  errors: Record<string, string>;
  onSubmit: () => void;
};

const inputClass = (hasError: boolean) =>
  `w-full bg-surface-container-low border-0 border-b-2 rounded-none px-0 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:ring-0 transition-all ${
    hasError
      ? "border-destructive"
      : "border-outline-variant focus:border-primary"
  }`;

export const UserFormDialog = ({
  open,
  onOpenChange,
  isEdit,
  form,
  setForm,
  errors,
  onSubmit,
}: Props) => {
  const { data: divisions = [], isLoading: loadingDivisions } = useDivisionsSelect(open);
  const { data: roles = [], isLoading: loadingRoles } = useRolesSelect(open);
  const update = (field: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...field }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-surface-container-lowest p-0">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-surface-container-low">
          <DialogHeader>
            <DialogTitle className="font-['Manrope'] text-xl font-bold text-primary">
              {isEdit ? "Edit Anggota" : "Tambah Anggota"}
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              {isEdit
                ? "Perbarui informasi anggota."
                : "Isi data anggota baru."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          {/* Nama */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Nama Lengkap *
            </Label>
            <Input
              value={form.nama}
              onChange={(e) => update({ nama: e.target.value })}
              placeholder="Nama lengkap"
              className={inputClass(!!errors.nama)}
            />
            {errors.nama && (
              <p className="text-xs text-destructive">{errors.nama}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Username *
            </Label>
            <Input
              value={form.username}
              onChange={(e) => update({ username: e.target.value })}
              placeholder="username"
              className={inputClass(!!errors.username)}
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Email *
            </Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="mail@example.com"
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password — hanya saat tambah */}
          {!isEdit && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Password *
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update({ password: e.target.value })}
                placeholder="••••••••"
                className={inputClass(!!errors.password)}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
          )}

          {/* Angkatan + No. Telepon */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Angkatan
              </Label>
              <Input
                type="number"
                value={form.angkatan}
                onChange={(e) =>
                  update({ angkatan: parseInt(e.target.value) || 0 })
                }
                placeholder="2024"
                className={inputClass(!!errors.angkatan)}
              />
              {errors.angkatan && (
                <p className="text-xs text-destructive">{errors.angkatan}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                No. Telepon
              </Label>
              <Input
                value={form.nomor_telepon}
                onChange={(e) => update({ nomor_telepon: e.target.value })}
                placeholder="+628xxxxxx"
                className={inputClass(!!errors.nomor_telepon)}
              />
              {errors.nomor_telepon && (
                <p className="text-xs text-destructive">
                  {errors.nomor_telepon}
                </p>
              )}
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Alamat
            </Label>
            <Input
              value={form.alamat}
              onChange={(e) => update({ alamat: e.target.value })}
              placeholder="Alamat lengkap"
              className={inputClass(!!errors.alamat)}
            />
            {errors.alamat && (
              <p className="text-xs text-destructive">{errors.alamat}</p>
            )}
          </div>

          {/* Divisi + Role */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Divisi
              </Label>
              {isEdit && (
                <p className="text-xs text-on-surface-variant">
                  Gunakan menu &quot;Pindah Divisi&quot; di tabel untuk mengubah
                  divisi.
                </p>
              )}
              <Select
                disabled={isEdit}
                value={form.division_id}
                onValueChange={(v) => update({ division_id: v })}
              >
                <SelectTrigger className="border-0 border-b-2 border-outline-variant rounded-none px-0 focus:border-primary focus:ring-0 bg-transparent">
                  <SelectValue placeholder={loadingDivisions ? "Memuat..." : "Pilih divisi"} />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((d) => (
                    <SelectItem
                      key={d.id}
                      value={d.id}
                      className="font-interface"
                    >
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.division_id && (
                <p className="text-xs text-destructive">{errors.division_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Role
              </Label>
              {isEdit && (
                <p className="text-xs text-on-surface-variant">
                  Gunakan menu &quot;Kelola Role&quot; di tabel untuk mengubah
                  role.
                </p>
              )}
              <Select
                disabled={isEdit}
                value={form.role_ids?.[0] ?? ""}
                onValueChange={(v) => update({ role_ids: [v] })}
              >
                <SelectTrigger className="border-0 border-b-2 border-outline-variant rounded-none px-0 focus:border-primary focus:ring-0 bg-transparent">
                  <SelectValue placeholder={loadingRoles ? "Memuat..." : "Pilih role"} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem
                      key={role.id}
                      value={role.id}
                      className="font-interface"
                    >
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role_ids && (
                <p className="text-xs text-destructive">{errors.role_ids}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Status
            </Label>
            <Select
              value={form.status}
              onValueChange={(v) => update({ status: v as User["status"] })}
            >
              <SelectTrigger className="border-0 border-b-2 border-outline-variant rounded-none px-0 focus:border-primary focus:ring-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif" className="font-interface">
                  Aktif
                </SelectItem>
                <SelectItem value="nonaktif" className="font-interface">
                  Nonaktif
                </SelectItem>
                <SelectItem value="alumni" className="font-interface">
                  Alumni
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-surface-container-low flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2.5 text-sm font-medium text-primary border border-outline/20 rounded-xl hover:bg-surface-container transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            className="font-bold px-6 py-2.5 text-sm text-on-primary bg-primary-gradient rounded-xl shadow-ambient hover:opacity-90 active:scale-95 transition-all"
          >
            {isEdit ? "Simpan" : "Tambah"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
