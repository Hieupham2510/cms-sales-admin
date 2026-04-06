import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  customers,
  products,
  salesOrderItems,
  salesOrderStatusLogs,
  salesOrders,
} from "@/db/schema";

type Params = {
  id: string;
  storeId: string;
};

export async function getSalesOrderById(params: Params) {
  const rows = await db
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
      soldBy: salesOrders.soldBy,
      soldAt: salesOrders.soldAt,
      statusChangedAt: salesOrders.statusChangedAt,
      statusChangedBy: salesOrders.statusChangedBy,
      customerId: customers.id,
      customerCode: customers.code,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerEmail: customers.email,
    })
    .from(salesOrders)
    .innerJoin(customers, eq(salesOrders.customerId, customers.id))
    .where(and(eq(salesOrders.id, params.id), eq(salesOrders.storeId, params.storeId)))
    .limit(1);

  const order = rows[0];
  if (!order) return null;

  const [items, logs] = await Promise.all([
    db
      .select({
        id: salesOrderItems.id,
        orderId: salesOrderItems.orderId,
        productId: salesOrderItems.productId,
        skuSnapshot: salesOrderItems.skuSnapshot,
        nameSnapshot: salesOrderItems.nameSnapshot,
        selectedVariants: salesOrderItems.selectedVariants,
        unitPrice: salesOrderItems.unitPrice,
        quantity: salesOrderItems.quantity,
        lineTotal: salesOrderItems.lineTotal,
        productCurrentStock: products.currentStock,
      })
      .from(salesOrderItems)
      .leftJoin(products, eq(salesOrderItems.productId, products.id))
      .where(eq(salesOrderItems.orderId, order.id))
      .orderBy(asc(salesOrderItems.createdAt)),
    db
      .select({
        id: salesOrderStatusLogs.id,
        fromStatus: salesOrderStatusLogs.fromStatus,
        toStatus: salesOrderStatusLogs.toStatus,
        reason: salesOrderStatusLogs.reason,
        changedAt: salesOrderStatusLogs.changedAt,
        changedBy: salesOrderStatusLogs.changedBy,
      })
      .from(salesOrderStatusLogs)
      .where(eq(salesOrderStatusLogs.orderId, order.id))
      .orderBy(asc(salesOrderStatusLogs.changedAt)),
  ]);

  return {
    ...order,
    items,
    logs,
  };
}
