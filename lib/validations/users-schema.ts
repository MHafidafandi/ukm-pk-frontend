import z from "zod";

export const CreateUserSchema = z.object({
  nama: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama terlalu panjang"),

  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya huruf, angka, underscore"),

  email: z.string().email("Format email tidak valid"),

  password: z.string().min(8, "Password minimal 8 karakter"),

  nomor_telepon: z
    .string()
    .regex(/^\+62\d{9,13}$/, "Nomor harus format +62xxxxxxxxx"),

  alamat: z.string().min(5, "Alamat terlalu pendek"),

  angkatan: z
    .number()
    .int("Angkatan harus bilangan bulat")
    .min(2000, "Angkatan minimal 2000")
    .max(new Date().getFullYear(), "Angkatan tidak valid"),

  status: z
    .enum(["aktif", "nonaktif", "alumni"])
    .refine((value) => value !== undefined, {
      message: "Status wajib diisi",
    }),

  division_id: z.string().min(1, "Division wajib diisi"),

  role_ids: z.array(z.string().min(1)).min(1, "Minimal 1 role"),
});

export const updateUserRequestSchema = z.object({
  nama: z
    .string()
    .min(2, "Nama harus memiliki minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .optional()
    .nullable(),

  username: z
    .string()
    .min(3, "Username harus memiliki minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9]+$/, "Username hanya boleh mengandung huruf dan angka")
    .optional()
    .nullable(),

  email: z.string().email("Format email tidak valid").optional().nullable(),

  nomor_telepon: z
    .string()
    .regex(
      /^\+[1-9]\d{1,14}$/,
      "Nomor telepon harus dalam format E.164 (contoh: +6281234567890)",
    )
    .optional()
    .nullable(),

  alamat: z.string().optional().nullable(),

  angkatan: z
    .number()
    .int("Angkatan harus berupa bilangan bulat")
    .min(2000, "Angkatan minimal tahun 2000")
    .max(2100, "Angkatan maksimal tahun 2100")
    .optional()
    .nullable(),

  status: z
    .enum(["aktif", "nonaktif", "alumni"] as const)
    .refine((value) => value !== undefined, {
      message: "Status harus berupa: aktif, nonaktif, atau alumni",
    })
    .optional()
    .nullable(),

  division_id: z.string().optional().nullable(),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserRequestSchema>;
