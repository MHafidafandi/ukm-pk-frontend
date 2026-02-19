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
import { User } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useDivisions } from "@/features/divisions/api/get-divisions";
import { useAssignUserDivision } from "../api/division-assignment";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
};

export const UserDivisionDialog = ({ open, onOpenChange, user }: Props) => {
  const [selectedDivision, setSelectedDivision] = useState("");

  const divisionsQuery = useDivisions();
  const assignDivision = useAssignUserDivision();

  const divisions = divisionsQuery.data?.data ?? [];

  useEffect(() => {
    if (user?.division_id) {
      setSelectedDivision(user.division_id);
    } else {
      setSelectedDivision("");
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user || !selectedDivision) return;

    // If no change, just close
    if (selectedDivision === user.division_id) {
      onOpenChange(false);
      return;
    }

    try {
      await assignDivision.mutateAsync({
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
            Pindahkan pengguna <strong>{user?.name}</strong> ke divisi lain.
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
                    {d.nama_divisi}
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
          <Button onClick={handleSave} disabled={assignDivision.isPending}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
