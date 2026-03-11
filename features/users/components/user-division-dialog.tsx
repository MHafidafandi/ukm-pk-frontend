import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useDivisionContext } from "@/features/divisions/contexts/DivisionContext";
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
    if (user?.division?.id) {
      setSelectedDivision(user.division.id);
    } else {
      setSelectedDivision("");
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user || !selectedDivision) return;

    // If no change, just close
    if (selectedDivision === user.division?.id) {
      onOpenChange(false);
      return;
    }

    try {
      await assignDivision({
        id: user.id,
        divisionId: selectedDivision,
      });
      toast.success("Divisi berhasil dipindahkan");
      onOpenChange(false);
    } catch (error) {
      toast.error("Gagal memindahkan divisi");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pindah Divisi</DialogTitle>
          <DialogDescription>
            Pindahkan pengguna <strong>{user?.nama}</strong> ke divisi lain.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Divisi</Label>
            <Select
              value={selectedDivision}
              onValueChange={setSelectedDivision}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isAssigningDivision}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
