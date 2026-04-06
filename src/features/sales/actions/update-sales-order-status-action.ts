"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  inventoryTransactions,
  products,
  salesOrderItems,
  salesOrderStatusLogs,
  salesOrders,
} from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import {
  updateSalesOrderStatusSchema,
  type UpdateSalesOrderStatusInput,
} from "@/features/sales/schemas/update-sales-order-status-schema";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

type Params = {
  orderId: string;
  input: UpdateSalesOrderStatusInput;
};

export async function updateSalesOrderStatusAction(params: Params) {
  const parsed = updateSalesOrderStatusSchema.parse(params.input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await db.transaction(async (tx) => {
    const [order] = await tx
      .select({
        id: salesOrders.id,
        orderCode: salesOrders.orderCode,
        status: salesOrders.status,
      })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.id, params.orderId),
          eq(salesOrders.storeId, DEMO_STORE_ID),
        ),
      )
      .limit(1);

    if (!order) {
      throw new Error("Không tìm thấy đơn bán");
    }

    if (order.status !== "processing") {
      throw new Error("Chỉ đơn đang xử lý mới được đổi trạng thái");
    }

    await tx
      .update(salesOrders)
      .set({
        status: parsed.toStatus,
        statusChangedAt: new Date(),
        statusChangedBy: user?.id ?? null,
        updatedAt: new Date(),
      })
      .where(eq(salesOrders.id, order.id));

    await tx.insert(salesOrderStatusLogs).values({
      orderId: order.id,
      fromStatus: order.status,
      toStatus: parsed.toStatus,
      reason: parsed.reason?.trim() || null,
      changedBy: user?.id ?? null,
      changedAt: new Date(),
    });

    if (parsed.toStatus === "failed_delivery" || parsed.toStatus === "cancelled") {
      const items = await tx
        .select({
          productId: salesOrderItems.productId,
          quantity: salesOrderItems.quantity,
          unitPrice: salesOrderItems.unitPrice,
          skuSnapshot: salesOrderItems.skuSnapshot,
        })
        .from(salesOrderItems)
        .where(eq(salesOrderItems.orderId, order.id));

      for (const item of items) {
        await tx
          .update(products)
          .set({
            currentStock: sql`${products.currentStock} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(and(eq(products.id, item.productId), eq(products.storeId, DEMO_STORE_ID)));
      }

      await tx.insert(inventoryTransactions).values(
        items.map((item) => ({
          storeId: DEMO_STORE_ID,
          productId: item.productId,
          type: "adjustment",
          quantity: item.quantity,
          unitCost: item.unitPrice,
          note: `Hoàn tồn do đơn ${order.orderCode} chuyển trạng thái ${parsed.toStatus}`,
          referenceType: "sales_order_status",
          referenceId: order.id,
          createdBy: user?.id ?? null,
        })),
      );
    }

    return {
      id: order.id,
      status: parsed.toStatus,
    };
  });

  revalidatePath("/sales/orders");
  revalidatePath(`/sales/orders/${result.id}`);

  return {
    success: true,
    ...result,
  };
}
