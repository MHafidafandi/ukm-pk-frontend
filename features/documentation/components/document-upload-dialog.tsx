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
import { Textarea } from "@/components/ui/textarea";
import { useCreateDocument } from "../hooks";

const documentSchema = z.object({
  judul: z.string().min(1, "Judul dokumen wajib diisi"),
  nomor_dokumen: z.string().optional(),
  kategori: z.enum([
    "laporan_kegiatan",
    "surat_keluar",
    "surat_masuk",
    "proposal",
    "lainnya",
  ]),
  deskripsi: z.string().default(""),
});

type DocumentSchema = z.infer<typeof documentSchema>;

export const DocumentUploadDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const createMutation = useCreateDocument();
  const form = useForm<DocumentSchema>({
    resolver: zodResolver(documentSchema as any),
    defaultValues: {
      judul: "",
      nomor_dokumen: "",
      kategori: "lainnya",
      deskripsi: "",
    },
  });

  const onSubmit: SubmitHandler<DocumentSchema> = (data) => {
    // File handling
    const fileInput = document.getElementById("doc-file") as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      form.setError("root", { message: "File wajib diunggah" });
      return;
    }

    createMutation.mutate(
      { data, file },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Unggah Dokumen</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Dokumen</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Laporan Kegiatan Agustus"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nomor_dokumen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Dokumen (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="No. Dokumen jika ada" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kategori"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="laporan_kegiatan">
                        Laporan Kegiatan
                      </SelectItem>
                      <SelectItem value="surat_keluar">Surat Keluar</SelectItem>
                      <SelectItem value="surat_masuk">Surat Masuk</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Keterangan singkat..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>File Dokumen</FormLabel>
              <FormControl>
                <Input id="doc-file" type="file" />
              </FormControl>
              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}
            </FormItem>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Mengunggah..." : "Unggah"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
