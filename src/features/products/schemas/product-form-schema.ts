import { z } from "zod";

const emptyStringToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export const productFormSchema = z.object({
  sku: z.string().trim().min(1, "Mã hàng là bắt buộc"),
  barcode: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  name: z.string().trim().min(1, "Tên hàng là bắt buộc"),

  categoryId: z.preprocess(
    emptyStringToNull,
    z.string().uuid().optional().nullable(),
  ),
  brandId: z.preprocess(
    emptyStringToNull,
    z.string().uuid().optional().nullable(),
  ),
  locationId: z.preprocess(
    emptyStringToNull,
    z.string().uuid().optional().nullable(),
  ),

  costPrice: z.string().default("0"),
  salePrice: z.string().default("0"),

  variants: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1, "Tên thuộc tính là bắt buộc"),
        values: z
          .array(
            z.object({
              id: z.string().min(1),
              label: z.string().trim().min(1, "Giá trị thuộc tính là bắt buộc"),
              priceAdjustment: z
                .string()
                .regex(/^\d+(\.\d{1,2})?$/, "Phụ thu giá không hợp lệ")
                .default("0"),
            }),
          )
          .min(1, "Mỗi thuộc tính cần ít nhất 1 giá trị"),
      }),
    )
    .default([]),

  currentStock: z.coerce.number().default(0),
  minStockAlert: z.coerce.number().default(0),
  maxStockAlert: z.coerce.number().default(0),

  weightValue: z.string().default("0"),
  weightUnit: z.string().default("g"),

  description: z.preprocess(
    emptyStringToNull,
    z.string().optional().nullable(),
  ),
  orderNote: z.preprocess(emptyStringToNull, z.string().optional().nullable()),

  status: z.string().default("active"),

  images: z
    .array(
      z.object({
        id: z.string().optional(),
        file: z.any().optional(),
        imageUrl: z.string().optional(),
        isPrimary: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }),
    )
    .default([]),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
