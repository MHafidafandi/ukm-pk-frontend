"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Asset } from "../services/assetService";

const loanSchema = z.object({
  asset_id: z.string().min(1, "Please select an asset"),
  user_id: z.string().min(1, "User ID is required"),
  tanggal_pinjam: z.string().min(1, "Date is required"),
  catatan: z.string().optional(),
});

export type LoanFormValues = z.infer<typeof loanSchema>;

interface LoanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Asset[];
  onSubmit: (data: LoanFormValues) => Promise<void>;
  isLoading?: boolean;
}

export const LoanFormDialog = ({
  open,
  onOpenChange,
  assets,
  onSubmit,
  isLoading = false,
}: LoanFormDialogProps) => {
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema as any),
    defaultValues: {
      asset_id: "",
      user_id: "",
      tanggal_pinjam: new Date().toISOString().split("T")[0],
      catatan: "",
    },
  });

  const handleSubmit: SubmitHandler<LoanFormValues> = async (data) => {
    await onSubmit(data);
    form.reset();
  };

  // Filter hanya aset yang tersedia untuk dipinjam
  const availableAssets = assets.filter(
    (a) => a.kondisi === "baik" && a.available > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Asset Loan</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="asset_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset to Borrow</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAssets.length === 0 ? (
                        <SelectItem value="_none" disabled>
                          No available assets
                        </SelectItem>
                      ) : (
                        availableAssets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.nama}
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({asset.kode})
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Borrower ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Borrower's User ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tanggal_pinjam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="catatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes{" "}
                    <span className="text-muted-foreground text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Loan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};