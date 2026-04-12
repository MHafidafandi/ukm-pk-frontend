import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/features/auth/contexts/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserContext } from "@/features/users/contexts/UserContext";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  divisions: { id: string; nama: string }[];
};

export const UserDivisionDialog = ({
  open,
  onOpenChange,
  user,
  divisions,
}: Props) => {
  const [selectedDivision, setSelectedDivision] = useState("");
  const { assignUserDivision: assignDivision, isAssigningDivision } =
    useUserContext();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedDivision(user?.division?.id ?? "");
  }, [user, open]);

  const handleSave = async () => {
    if (!user || !selectedDivision) return;
    if (selectedDivision === user.division?.id) {
      onOpenChange(false);
      return;
    }
    try {
      await assignDivision({ id: user.id, divisionId: selectedDivision });
      toast.success("Divisi berhasil dipindahkan");
      onOpenChange(false);
    } catch {
      toast.error("Gagal memindahkan divisi");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest p-0">
        <div className="px-8 pt-8 pb-6 bg-surface-container-low">
          <DialogHeader>
            <DialogTitle className="font-['Manrope'] text-xl font-bold text-primary">
              Pindah Divisi
            </DialogTitle>
            <DialogDescription className=" text-sm text-on-surface-variant">
              Pindahkan{" "}
              <strong className="text-on-surface">{user?.nama}</strong> ke
              divisi lain.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-8 py-6 space-y-2">
          <Label className=" text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Divisi
          </Label>
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className=" border-0 border-b-2 border-outline-variant rounded-none px-0 focus:border-primary focus:ring-0 bg-transparent">
              <SelectValue placeholder="Pilih divisi" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((d) => (
                <SelectItem key={d.id} value={d.id} className="">
                  {d.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="px-8 py-5 bg-surface-container-low flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className=" px-5 py-2.5 text-sm font-medium text-primary border border-outline/20 rounded-xl hover:bg-surface-container transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isAssigningDivision}
            className=" font-bold px-6 py-2.5 text-sm text-on-primary bg-primary-gradient rounded-xl shadow-ambient hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
