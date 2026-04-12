import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Division } from "@/features/divisions/services/divisionService";
import { AlertCircle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  division: Division | null;
  onConfirm: () => void;
};

export const DivisionDeleteDialog = ({
  open,
  onOpenChange,
  division,
  onConfirm,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest border-outline-variant/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-error-container rounded-full">
              <AlertCircle className="w-5 h-5 text-error" />
            </div>
            <DialogTitle className="font-['Manrope'] text-on-surface">
              Delete Division
            </DialogTitle>
          </div>
          <DialogDescription className="text-on-surface-variant">
            Are you sure you want to delete the division{" "}
            <strong className="font-['Manrope'] text-on-surface">
              {division?.nama_divisi}
            </strong>
            ?
            <br />
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-error hover:bg-error text-on-error"
          >
            Delete Division
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
