import { z } from "zod";

export const createSalesOrderSchema = z.object({
  customerId: z.string().uuid("Khách hàng không hợp lệ"),
  note: z.string().trim().max(500).optional().nullable(),
  discountAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().default("0"),
  paidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().default("0"),
  paymentMethod: z
    .enum(["cash", "bank_transfer", "card", "e_wallet"])
    .optional()
    .default("cash"),
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Sản phẩm không hợp lệ"),
        quantity: z.coerce.number().int().positive("Số lượng phải lớn hơn 0"),
        selectedVariants: z
          .array(
            z.object({
              groupId: z.string().min(1),
              valueId: z.string().min(1),
            }),
          )
          .default([]),
      }),
    )
    .min(1, "Vui lòng chọn ít nhất 1 sản phẩm"),
});

export type CreateSalesOrderInput = z.input<typeof createSalesOrderSchema>;
export type CreateSalesOrderValues = z.output<typeof createSalesOrderSchema>;
