import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().trim().min(2, "Tên cửa hàng tối thiểu 2 ký tự").max(120, "Tên cửa hàng quá dài"),
  slug: z
    .string()
    .trim()
    .max(120, "Slug quá dài")
    .optional()
    .default(""),
  logoFile: z.instanceof(File).optional().nullable(),
});

export type CreateStoreInput = z.input<typeof createStoreSchema>;
export type CreateStoreValues = z.output<typeof createStoreSchema>;
