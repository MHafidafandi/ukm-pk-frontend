import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(8, { error: "Be at least 8 characters long" })
    .trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
