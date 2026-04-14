import { z } from "zod";

export const updateStoreSchema = z.object({
  id: z.string().uuid("ID cửa hàng không hợp lệ"),
  name: z.string().trim().min(2, "Tên cửa hàng tối thiểu 2 ký tự").max(120, "Tên cửa hàng quá dài"),
  slug: z
    .string()
    .trim()
    .max(120, "Slug quá dài")
    .optional()
    .default(""),
  logoFile: z.instanceof(File).optional().nullable(),
});

export type UpdateStoreInput = z.input<typeof updateStoreSchema>;
