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
import { CreateDivisionInput } from "@/features/divisions/services/divisionService";

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
      <DialogContent className="sm:max-w-lg bg-surface-container-lowest border-outline-variant/20">
        <DialogHeader>
          <DialogTitle className="font-['Manrope'] text-on-surface">
            {isEdit ? "Edit Division" : "Create New Division"}
          </DialogTitle>
          <DialogDescription className="text-on-surface-variant">
            {isEdit
              ? "Update division information and settings."
              : "Add a new division to your organization."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-on-surface font-medium">
              Division Name *
            </Label>
            <Input
              value={form.nama_divisi}
              onChange={(e) =>
                setForm({
                  ...form,
                  nama_divisi: e.target.value,
                })
              }
              placeholder="e.g., Research & Development"
              className="bg-surface-container-low border-outline-variant/30 placeholder:text-on-surface-variant focus:border-primary"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-on-surface font-medium">Description</Label>
            <Textarea
              value={form.deskripsi}
              onChange={(e) =>
                setForm({
                  ...form,
                  deskripsi: e.target.value,
                })
              }
              placeholder="Describe the division's role and responsibilities..."
              className="bg-surface-container-low border-outline-variant/30 placeholder:text-on-surface-variant focus:border-primary"
            />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-primary-gradient text-on-primary hover:shadow-md"
          >
            {isEdit ? "Save Changes" : "Create Division"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
