import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { customers, salesOrderItems, salesOrders } from "@/db/schema";
import type { SalesOrderStatus } from "../types";

type Params = {
  storeId: string;
  status?: SalesOrderStatus | "all";
};

export async function getSalesOrders(params: Params) {
  const conditions = [eq(salesOrders.storeId, params.storeId)];

  if (params.status && params.status !== "all") {
    conditions.push(eq(salesOrders.status, params.status));
  }

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
      customerId: salesOrders.customerId,
      customerCode: customers.code,
      customerName: customers.name,
    })
    .from(salesOrders)
    .innerJoin(customers, eq(salesOrders.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(salesOrders.soldAt));

  if (orders.length === 0) return [];

  const itemRows = await db
    .select({
      orderId: salesOrderItems.orderId,
      quantity: salesOrderItems.quantity,
    })
    .from(salesOrderItems)
    .where(inArray(salesOrderItems.orderId, orders.map((item) => item.id)));

  const quantityMap = new Map<string, number>();
  for (const row of itemRows) {
    quantityMap.set(row.orderId, (quantityMap.get(row.orderId) ?? 0) + row.quantity);
  }

  return orders.map((order) => ({
    ...order,
    itemQuantityTotal: quantityMap.get(order.id) ?? 0,
  }));
}
