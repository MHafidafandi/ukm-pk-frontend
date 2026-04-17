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
import { Form, FormField } from "@/components/ui/form";
import { Loader2, PackageSearch } from "lucide-react";
import { Asset } from "../services/assetService";
import { useUsersActiveSelect } from "@/lib/services/selectService";

// ── Schema ────────────────────────────────────────────────────────────────────
const loanSchema = z.object({
  asset_id: z.string().min(1, "Pilih aset terlebih dahulu"),
  user_id: z.string().min(1, "User ID wajib diisi"),
  tanggal_pinjam: z.string().min(1, "Tanggal wajib diisi"),
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

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldWrapper = ({
  label,
  children,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
      {label}
      {hint && (
        <span className="ml-1 normal-case tracking-normal font-medium text-outline">
          ({hint})
        </span>
      )}
    </label>
    {children}
    {error && <p className="text-xs text-error mt-0.5">{error}</p>}
  </div>
);

const inputClass =
  "w-full bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-t-lg px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors placeholder:text-outline";

// ── Component ─────────────────────────────────────────────────────────────────
export const LoanFormDialog = ({
  open,
  onOpenChange,
  assets,
  onSubmit,
  isLoading = false,
}: LoanFormDialogProps) => {
  const { data: users = [], isLoading: loadingUsers } = useUsersActiveSelect(open);
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema as any),
    defaultValues: {
      asset_id: "",
      user_id: "",
      tanggal_pinjam: new Date().toISOString().split("T")[0],
      catatan: "",
    },
  });

  const {
    formState: { errors },
  } = form;

  const handleSubmit: SubmitHandler<LoanFormValues> = async (data) => {
    await onSubmit(data);
    form.reset();
  };

  const availableAssets = assets.filter(
    (a) => a.kondisi === "baik" && a.available > 0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-surface p-0">
        {/* ── Header ── */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-outline-variant/10">
          <DialogTitle className="font-['Manrope'] font-bold text-xl text-on-surface">
            Catat Peminjaman
          </DialogTitle>
          <p className="text-sm text-on-surface-variant mt-1">
            Rekam peminjaman aset kepada anggota organisasi.
          </p>
        </DialogHeader>

        {/* ── Form ── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="px-8 py-6 space-y-6"
          >
            {/* Asset */}
            <FormField
              control={form.control}
              name="asset_id"
              render={({ field }) => (
                <FieldWrapper
                  label="Aset yang Dipinjam"
                  error={errors.asset_id?.message}
                >
                  {availableAssets.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container text-on-surface-variant">
                      <PackageSearch className="w-5 h-5 shrink-0" />
                      <span className="text-sm">
                        Tidak ada aset yang tersedia untuk dipinjam.
                      </span>
                    </div>
                  ) : (
                    <select {...field} className={inputClass}>
                      <option value="">— Pilih aset —</option>
                      {availableAssets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nama} ({a.kode}) · {a.available} tersedia
                        </option>
                      ))}
                    </select>
                  )}
                </FieldWrapper>
              )}
            />

            {/* User ID */}
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FieldWrapper
                  label="Peminjam"
                  error={errors.user_id?.message}
                >
                   <select {...field} className={inputClass}>
                    <option value="">
                      {loadingUsers ? "Memuat..." : "— Pilih pengampu/peminjam —"}
                    </option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>
              )}
            />

            {/* Tanggal */}
            <FormField
              control={form.control}
              name="tanggal_pinjam"
              render={({ field }) => (
                <FieldWrapper
                  label="Tanggal Pinjam"
                  error={errors.tanggal_pinjam?.message}
                >
                  <input {...field} type="date" className={inputClass} />
                </FieldWrapper>
              )}
            />

            {/* Catatan */}
            <FormField
              control={form.control}
              name="catatan"
              render={({ field }) => (
                <FieldWrapper label="Catatan" hint="opsional">
                  <textarea
                    {...field}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Tujuan peminjaman atau catatan tambahan..."
                  />
                </FieldWrapper>
              )}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading || availableAssets.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Menyimpan..." : "Catat Peminjaman"}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
