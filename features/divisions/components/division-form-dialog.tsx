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
import { Textarea } from "@/components/ui/textarea";
import { CreateDivisionInput } from "../api/create-division";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  form: CreateDivisionInput;
  setForm: React.Dispatch<React.SetStateAction<CreateDivisionInput>>;
  onSubmit: () => void;
};

export const DivisionFormDialog = ({
  open,
  onOpenChange,
  isEdit,
  form,
  setForm,
  onSubmit,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Divisi" : "Tambah Divisi"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui informasi divisi." : "Isi data divisi baru."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Nama Divisi *</Label>
            <Input
              value={form.nama_divisi}
              onChange={(e) =>
                setForm({
                  ...form,
                  nama_divisi: e.target.value,
                })
              }
              placeholder="Nama divisi"
            />
          </div>

          <div className="grid gap-2">
            <Label>Deskripsi</Label>
            <Textarea
              value={form.deskripsi}
              onChange={(e) =>
                setForm({
                  ...form,
                  deskripsi: e.target.value,
                })
              }
              placeholder="Deskripsi tugas divisi"
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
