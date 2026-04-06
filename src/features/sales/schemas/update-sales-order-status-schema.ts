import { z } from "zod";

export const updateSalesOrderStatusSchema = z.object({
  toStatus: z.enum(["completed", "failed_delivery", "cancelled"]),
  reason: z.string().trim().max(500).optional().nullable(),
});

export type UpdateSalesOrderStatusInput = z.input<typeof updateSalesOrderStatusSchema>;
export type UpdateSalesOrderStatusValues = z.output<typeof updateSalesOrderStatusSchema>;
