"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  deskripsi: z.string(),
  tipe_dokumen: z.enum(["sop", "template", "panduan", "laporan", "lainnya"]),
  link_gdrive: z
    .string()
    .url("Link Google Drive tidak valid")
    .optional()
    .or(z.literal("")),
  nama_file: z.string().optional().or(z.literal("")),
  ukuran_file: z.string().optional().or(z.literal("")),
  tipe_file: z.string().optional().or(z.literal("")),
  activity_id: z.string().optional().or(z.literal("")),
  status: z.enum(["aktif", "arsip"]),
});

type DocumentSchema = z.infer<typeof documentSchema>;

const inputClass =
  "w-full bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-none px-0 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:ring-0 focus:border-primary transition-all";
const labelClass =
  "text-xs font-bold uppercase tracking-widest text-on-surface-variant";
const selectTriggerClass =
  "border-0 border-b-2 border-outline-variant rounded-none px-0 focus:border-primary focus:ring-0 bg-transparent";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

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
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi,
        tipe_dokumen: data.tipe_dokumen,
        link_gdrive: data.link_gdrive || undefined,
        nama_file: data.nama_file || undefined,
        ukuran_file: undefined,
        tipe_file: data.tipe_file || undefined,
        activity_id: data.activity_id || undefined,
        status: data.status,
      },
    }).then(() => {
      form.reset();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-surface-container-lowest p-0 max-h-[90vh] overflow-y-auto">
        <div className="px-8 pt-8 pb-6 bg-surface-container-low sticky top-0 z-10">
          <DialogHeader>
            <DialogTitle className="font-['Manrope'] text-xl font-bold text-primary">
              Tambah Dokumentasi
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              Tambahkan dokumen baru ke sistem.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-8 py-6 space-y-6"
          >
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelClass}>Judul</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: SOP Rapat Rutin"
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelClass}>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ringkasan singkat dokumen"
                      {...field}
                      className="bg-surface-container-low border-0 border-b-2 border-outline-variant rounded-none px-0 py-2.5 text-sm placeholder:text-on-surface-variant focus-visible:ring-0 focus:border-primary transition-all resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="tipe_dokumen"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>Tipe Dokumen</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sop" className="font-interface">
                          SOP
                        </SelectItem>
                        <SelectItem value="template" className="font-interface">
                          Template
                        </SelectItem>
                        <SelectItem value="panduan" className="font-interface">
                          Panduan
                        </SelectItem>
                        <SelectItem value="laporan" className="font-interface">
                          Laporan
                        </SelectItem>
                        <SelectItem value="lainnya" className="font-interface">
                          Lainnya
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={selectTriggerClass}>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aktif" className="font-interface">
                          Aktif
                        </SelectItem>
                        <SelectItem value="arsip" className="font-interface">
                          Arsip
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="link_gdrive"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={labelClass}>
                    Link Google Drive
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://drive.google.com/..."
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nama_file"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>Nama File</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SOP_Rapat.pdf"
                        {...field}
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipe_file"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>Tipe File</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="pdf, docx, xlsx"
                        {...field}
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ukuran_file"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>
                      Ukuran File (bytes)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="2048000"
                        {...field}
                        value={field.value ?? ""}
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activity_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className={labelClass}>Activity ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kosongkan jika umum"
                        {...field}
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-5 py-2.5 text-sm font-medium text-primary border border-outline/20 rounded-xl hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="font-bold px-6 py-2.5 text-sm text-on-primary bg-primary-gradient rounded-xl shadow-ambient hover:opacity-90 active:scale-95 transition-all"
              >
                Simpan
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
