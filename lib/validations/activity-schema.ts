import { z } from "zod";

// --- Activity ---
export const ActivityStatusSchema = z.enum([
  "pending",
  "ongoing",
  "completed",
  "cancelled",
]);
export type ActivityStatus = z.infer<typeof ActivityStatusSchema>;

export const CreateActivitySchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().min(1, "Deskripsi wajib diisi"),
  tanggal: z.string().or(z.date()), // API seems to accept string date
  lokasi: z.string().min(1, "Lokasi wajib diisi"),
});

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;

export const UpdateActivitySchema = CreateActivitySchema.partial();
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;

export const UpdateActivityStatusSchema = z.object({
  status: ActivityStatusSchema,
});
export type UpdateActivityStatusInput = z.infer<
  typeof UpdateActivityStatusSchema
>;

// --- Progress Report ---
export const CreateProgressReportSchema = z.object({
  activity_id: z.string().min(1, "Activity ID wajib diisi"),
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().min(1, "Deskripsi wajib diisi"),
  tanggal: z.string().or(z.date()),
});

export type CreateProgressReportInput = z.infer<
  typeof CreateProgressReportSchema
>;

export const UpdateProgressReportSchema =
  CreateProgressReportSchema.partial().omit({ activity_id: true });
export type UpdateProgressReportInput = z.infer<
  typeof UpdateProgressReportSchema
>;

// --- LPJ ---
export const CreateLpjSchema = z.object({
  activity_id: z.string().min(1, "Activity ID wajib diisi"),
  tanggal: z.string().or(z.date()),
  // File upload logic might be handled separately or added here if API accepts file metadata first
});

export type CreateLpjInput = z.infer<typeof CreateLpjSchema>;

// --- Documentation ---
export const DocumentationTypeSchema = z.enum([
  "foto",
  "video",
  "dokumen",
  "lainnya",
]);
export type DocumentationType = z.infer<typeof DocumentationTypeSchema>;

export const CreateDocumentationSchema = z.object({
  activity_id: z.string().min(1, "Activity ID wajib diisi"),
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().optional(),
  tipe_dokumen: DocumentationTypeSchema.default("foto"),
  link_gdrive: z
    .string()
    .url("Link GDrive tidak valid")
    .optional()
    .or(z.literal("")),
  // For file uploads, we usually explicitly handle file objects, but API expects metadata
  nama_file: z.string().optional(),
  ukuran_file: z.number().optional(),
  tipe_file: z.string().optional(),
});

export type CreateDocumentationInput = z.infer<
  typeof CreateDocumentationSchema
>;

export const UpdateDocumentationSchema =
  CreateDocumentationSchema.partial().omit({ activity_id: true });
export type UpdateDocumentationInput = z.infer<
  typeof UpdateDocumentationSchema
>;
