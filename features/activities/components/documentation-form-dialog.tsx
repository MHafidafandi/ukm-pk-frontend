import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateDocumentationInput,
  DocumentationType,
} from "@/lib/validations/activity-schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CreateDocumentationInput;
  setForm: React.Dispatch<React.SetStateAction<CreateDocumentationInput>>;
  onSubmit: () => void;
};

export const DocumentationFormDialog = ({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Dokumentasi</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Judul */}
          <div className="grid gap-2">
            <Label>Judul *</Label>
            <Input
              value={form.judul}
              onChange={(e) =>
                setForm({
                  ...form,
                  judul: e.target.value,
                })
              }
              placeholder="Contoh: Foto Kegiatan Hari 1"
            />
          </div>

          {/* Tipe Dokumen */}
          <div className="grid gap-2">
            <Label>Tipe Dokumen</Label>
            <Select
              value={form.tipe_dokumen}
              onValueChange={(val: DocumentationType) =>
                setForm({ ...form, tipe_dokumen: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foto">Foto</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="dokumen">Dokumen</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Link GDrive */}
          <div className="grid gap-2">
            <Label>Link Google Drive (Opsional)</Label>
            <Input
              value={form.link_gdrive || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  link_gdrive: e.target.value,
                })
              }
              placeholder="https://drive.google.com/..."
            />
          </div>

          {/* Deskripsi */}
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
              placeholder="Keterangan tambahan..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
