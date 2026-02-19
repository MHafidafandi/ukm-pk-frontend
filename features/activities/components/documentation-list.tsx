"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  useDocumentations,
  useCreateDocumentation,
  useDeleteDocumentation,
  Documentation,
} from "../api/documentations";
import { DocumentationFormDialog } from "./documentation-form-dialog";
import {
  CreateDocumentationInput,
  CreateDocumentationSchema,
} from "@/lib/validations/activity-schema";

type Props = {
  activityId: string;
};

const emptyForm = (activityId: string): CreateDocumentationInput => ({
  activity_id: activityId,
  judul: "",
  deskripsi: "",
  tipe_dokumen: "foto",
  link_gdrive: "",
});

export const DocumentationList = ({ activityId }: Props) => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Documentation | null>(null);
  const [form, setForm] = useState<CreateDocumentationInput>(
    emptyForm(activityId),
  );

  // The API might return { data: [...] } or just [...] depending on implementation.
  // Based on my api file it returns { data: ... }
  const { data: response } = useDocumentations(activityId);
  // Ensure we handle both cases if API structure is ambiguous, but strictly following my API file:
  const docs = response?.data ?? [];

  const createDoc = useCreateDocumentation();
  const deleteDoc = useDeleteDocumentation();

  const openAdd = () => {
    setForm(emptyForm(activityId));
    setFormOpen(true);
  };

  const openDelete = (item: Documentation) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validate schema
      // Note: link_gdrive optional check
      const parsed = CreateDocumentationSchema.parse(form);

      await createDoc.mutateAsync({
        data: parsed,
      });
      toast.success("Dokumentasi ditambahkan");
      setFormOpen(false);
    } catch (err: any) {
      if (err.name === "ZodError") {
        toast.error(err.errors[0].message);
        return;
      }
      toast.error("Gagal menyimpan dokumentasi");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDoc.mutateAsync({ id: deleting.id });
      toast.success("Dokumentasi dihapus");
      setDeleteOpen(false);
    } catch {
      toast.error("Gagal menghapus dokumentasi");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "foto":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "dokumen":
        return <FileText className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Dokumentasi</h3>
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Dokumentasi
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {docs.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground border rounded-lg border-dashed">
            Belum ada dokumentasi.
          </div>
        ) : (
          docs.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {getIcon(item.tipe_dokumen)}
                  <CardTitle
                    className="text-sm font-medium truncate"
                    title={item.judul}
                  >
                    {item.judul}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <CardDescription className="line-clamp-2 text-xs">
                  {item.deskripsi || "Tidak ada deskripsi"}
                </CardDescription>
                {item.link_gdrive && (
                  <a
                    href={item.link_gdrive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 block truncate"
                  >
                    Buka Link Drive
                  </a>
                )}
              </CardContent>
              <CardFooter className="justify-end pt-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => openDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <DocumentationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        form={form}
        setForm={setForm}
        onSubmit={handleSave}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dokumentasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
