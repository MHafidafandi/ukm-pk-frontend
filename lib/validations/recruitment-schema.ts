import { z } from "zod";

// ─── Recruitment Status ───────────────────────────────────────────────
export const RecruitmentStatusSchema = z.enum([
  "draft",
  "open",
  "closed",
  "archived",
]);
export type RecruitmentStatus = z.infer<typeof RecruitmentStatusSchema>;

// ─── Date helpers ─────────────────────────────────────────────────────
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus yyyy-MM-dd");

const dateFieldSchema = z
  .union([z.string(), z.date()])
  .transform((val) => {
    if (val instanceof Date) {
      const year = val.getFullYear();
      const month = String(val.getMonth() + 1).padStart(2, "0");
      const day = String(val.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`; // uses local timezone
    }
    return val;
  })
  .pipe(dateStringSchema);

// ─── Create Recruitment ───────────────────────────────────────────────
export const CreateRecruitmentSchema = z
  .object({
    nama_recruitment: z
      .string({ message: "Judul wajib diisi" })
      .min(1, "Judul wajib diisi"),
    deskripsi: z
      .string({ message: "Deskripsi wajib diisi" })
      .min(1, "Deskripsi wajib diisi"),
    tanggal_buka: dateFieldSchema,
    tanggal_tutup: dateFieldSchema,
    announcement_link: z
      .string()
      .url("Link pengumuman harus berupa URL yang valid")
      .optional()
      .or(z.literal("")),
    status: RecruitmentStatusSchema.default("draft"),
    requirements: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      const buka = new Date(data.tanggal_buka);
      const tutup = new Date(data.tanggal_tutup);
      return tutup >= buka;
    },
    {
      message: "Tanggal tutup harus sama atau setelah tanggal buka",
      path: ["tanggal_tutup"],
    }
  );

export type CreateRecruitmentInput = z.infer<typeof CreateRecruitmentSchema>;

// ─── Update Recruitment ───────────────────────────────────────────────
export const UpdateRecruitmentSchema = z
  .object({
    nama_recruitment: z.string().min(1, "Judul wajib diisi").optional(),
    deskripsi: z.string().min(1, "Deskripsi wajib diisi").optional(),
    tanggal_buka: dateFieldSchema.optional(),
    tanggal_tutup: dateFieldSchema.optional(),
    announcement_link: z
      .string()
      .url("Link pengumuman harus berupa URL yang valid")
      .optional()
      .or(z.literal("")),
    status: RecruitmentStatusSchema.optional(),
    requirements: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.tanggal_buka && data.tanggal_tutup) {
        const buka = new Date(data.tanggal_buka);
        const tutup = new Date(data.tanggal_tutup);
        return tutup >= buka;
      }
      return true;
    },
    {
      message: "Tanggal tutup harus sama atau setelah tanggal buka",
      path: ["tanggal_tutup"],
    }
  );

export type UpdateRecruitmentInput = z.infer<typeof UpdateRecruitmentSchema>;

// ─── Registrant Status ────────────────────────────────────────────────
export const RegistrantStatusSchema = z.enum([
  "pending",
  "accepted",
  "rejected",
  "interview",
]);
export type RegistrantStatus = z.infer<typeof RegistrantStatusSchema>;

// ─── Register to Recruitment ──────────────────────────────────────────
export const RegisterRecruitmentSchema = z.object({
  recruit_id: z.string().or(z.number()),
  notes: z.string().optional(),
});
export type RegisterRecruitmentInput = z.infer<
  typeof RegisterRecruitmentSchema
>;

// ─── Update Registrant Status (accept / reject) ──────────────────────
export const UpdateRegistrantStatusSchema = z.object({
  status: RegistrantStatusSchema,
  notes: z.string().optional(),
});
export type UpdateRegistrantStatusInput = z.infer<
  typeof UpdateRegistrantStatusSchema
>;