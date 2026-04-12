import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateRoleInput } from "@/features/roles/services/roleService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: CreateRoleInput;
  setForm: React.Dispatch<React.SetStateAction<CreateRoleInput>>;
  onSubmit: () => void;
};

export const RoleFormDialog = ({
  open,
  onOpenChange,
  isEdit,
  form,
  setForm,
  onSubmit,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest p-0">
        <div className="px-8 pt-8 pb-6 bg-surface-container-low">
          <DialogHeader>
            <DialogTitle className="font-['Manrope'] text-xl font-bold text-primary">
              {isEdit ? "Edit Role" : "Tambah Role"}
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              {isEdit ? "Perbarui informasi role." : "Isi data role baru."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-8 py-6 space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Nama Role *
          </Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama role (misal: admin, member)"
            className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-none px-0 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:ring-0 focus:border-primary transition-all"
          />
        </div>

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
