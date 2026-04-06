import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { salesOrderItems, salesOrders } from "@/db/schema";

type Params = {
  storeId: string;
  customerId: string;
};

export async function getCustomerCompletedOrders(params: Params) {
  const orders = await db
    .select({
      id: salesOrders.id,
      orderCode: salesOrders.orderCode,
      status: salesOrders.status,
      subtotalAmount: salesOrders.subtotalAmount,
      discountAmount: salesOrders.discountAmount,
      totalAmount: salesOrders.totalAmount,
      paidAmount: salesOrders.paidAmount,
      paymentMethod: salesOrders.paymentMethod,
      note: salesOrders.note,
      soldAt: salesOrders.soldAt,
    })
    .from(salesOrders)
    .where(
      and(
        eq(salesOrders.storeId, params.storeId),
        eq(salesOrders.customerId, params.customerId),
        eq(salesOrders.status, "completed"),
      ),
    )
    .orderBy(desc(salesOrders.soldAt));

  if (orders.length === 0) {
    return [];
  }

  const items = await db
    .select({
      orderId: salesOrderItems.orderId,
      id: salesOrderItems.id,
      productId: salesOrderItems.productId,
      skuSnapshot: salesOrderItems.skuSnapshot,
      nameSnapshot: salesOrderItems.nameSnapshot,
      selectedVariants: salesOrderItems.selectedVariants,
      unitPrice: salesOrderItems.unitPrice,
      quantity: salesOrderItems.quantity,
      lineTotal: salesOrderItems.lineTotal,
    })
    .from(salesOrderItems)
    .where(inArray(salesOrderItems.orderId, orders.map((order) => order.id)))
    .orderBy(asc(salesOrderItems.createdAt));

  const itemMap = new Map<string, typeof items>();
  for (const item of items) {
    const current = itemMap.get(item.orderId) ?? [];
    current.push(item);
    itemMap.set(item.orderId, current);
  }

  return orders.map((order) => {
    const orderItems = itemMap.get(order.id) ?? [];

    return {
      ...order,
      items: orderItems,
      itemQuantityTotal: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  });
}
