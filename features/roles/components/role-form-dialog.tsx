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
import { CreateRoleInput } from "../api/create-role";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "Tambah Role"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui informasi role." : "Isi data role baru."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Nama Role *</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              placeholder="Nama role (misal: admin, member)"
            />
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
