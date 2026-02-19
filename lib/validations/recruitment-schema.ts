import { z } from "zod";

export const RecruitmentStatusSchema = z.enum(["open", "closed", "draft"]);
export type RecruitmentStatus = z.infer<typeof RecruitmentStatusSchema>;

export const CreateRecruitmentSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  start_date: z.string().or(z.date()),
  end_date: z.string().or(z.date()),
  status: RecruitmentStatusSchema.default("draft"),
  requirements: z.array(z.string()).optional(),
});

export type CreateRecruitmentInput = z.infer<typeof CreateRecruitmentSchema>;

export const UpdateRecruitmentSchema = CreateRecruitmentSchema.partial();
export type UpdateRecruitmentInput = z.infer<typeof UpdateRecruitmentSchema>;

export const RegistrantStatusSchema = z.enum([
  "pending",
  "accepted",
  "rejected",
  "interview",
]);
export type RegistrantStatus = z.infer<typeof RegistrantStatusSchema>;

export const RegisterRecruitmentSchema = z.object({
  notes: z.string().optional(),
  // User data is usually taken from the authenticated session
  // or additional fields if needed (e.g., specific answers)
});

export type RegisterRecruitmentInput = z.infer<
  typeof RegisterRecruitmentSchema
>;

export const UpdateRegistrantStatusSchema = z.object({
  status: RegistrantStatusSchema,
  notes: z.string().optional(),
});

export type UpdateRegistrantStatusInput = z.infer<
  typeof UpdateRegistrantStatusSchema
>;
