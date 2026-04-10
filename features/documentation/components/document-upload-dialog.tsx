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
import { useDocumentationContext } from "../contexts/DocumentationContext";

const documentSchema = z.object({
  judul: z.string().min(1, "Judul dokumen wajib diisi"),
  deskripsi: z.string().default(""),
  tipe_dokumen: z.enum(["sop", "template", "panduan", "laporan", "lainnya"]),
  link_gdrive: z
    .string()
    .url("Link Google Drive tidak valid")
    .optional()
    .or(z.literal("")),
  nama_file: z.string().optional().or(z.literal("")),
  ukuran_file: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .or(z.literal("")),
  tipe_file: z.string().optional().or(z.literal("")),
  activity_id: z.string().optional().or(z.literal("")),
  status: z.enum(["aktif", "arsip"]),
});

type DocumentSchema = z.infer<typeof documentSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DocumentUploadDialog = ({ open, onOpenChange }: Props) => {
  const { createDocument: createMutation } = useDocumentationContext();

  const form = useForm<DocumentSchema>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      judul: "",
      deskripsi: "",
      tipe_dokumen: "lainnya",
      link_gdrive: "",
      nama_file: "",
      ukuran_file: "",
      tipe_file: "",
      activity_id: "",
      status: "aktif",
    },
  });

  const onSubmit: SubmitHandler<DocumentSchema> = (data) => {
    void createMutation({
      judul: data.judul,
      deskripsi: data.deskripsi,
      tipe_dokumen: data.tipe_dokumen,
      link_gdrive: data.link_gdrive || undefined,
      nama_file: data.nama_file || undefined,
      ukuran_file:
        data.ukuran_file === "" || data.ukuran_file === undefined
          ? undefined
          : Number(data.ukuran_file),
      tipe_file: data.tipe_file || undefined,
      activity_id: data.activity_id || undefined,
      status: data.status,
    }).then(() => {
      form.reset();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Tambah Documentation</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: SOP Rapat Rutin" {...field} />
                  </FormControl>
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
                    <Textarea
                      placeholder="Ringkasan singkat dokumen"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipe_dokumen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Dokumen</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sop">SOP</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="panduan">Panduan</SelectItem>
                      <SelectItem value="laporan">Laporan</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="arsip">Arsip</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link_gdrive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Google Drive</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://drive.google.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nama_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama File</FormLabel>
                    <FormControl>
                      <Input placeholder="SOP_Rapat_Rutin.pdf" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipe_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe File</FormLabel>
                    <FormControl>
                      <Input placeholder="pdf, docx, xlsx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="ukuran_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ukuran File</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="2048000"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activity_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kosongkan jika dokumen umum"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
