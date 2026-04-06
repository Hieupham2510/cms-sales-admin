"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  customers,
  inventoryTransactions,
  products,
  salesOrderItems,
  salesOrderStatusLogs,
  salesOrders,
} from "@/db/schema";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { createClient } from "@/lib/supabase/server";
import {
  createSalesOrderSchema,
  type CreateSalesOrderInput,
} from "@/features/sales/schemas/create-sales-order-schema";
import type { SalesOrderStockIssue } from "@/features/sales/types";
import {
  calculateVariantAdjustedPrice,
  normalizeProductVariants,
  type SelectedVariant,
} from "@/features/products/variant-utils";

function numericToString(value: number) {
  return value.toFixed(2);
}

function buildOrderCode(sequence: number) {
  return `HD${String(sequence).padStart(6, "0")}`;
}

export async function createSalesOrderAction(input: CreateSalesOrderInput) {
  const storeId = await getActiveStoreIdOrThrow();
  const parsed = createSalesOrderSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return db.transaction(async (tx) => {
    const [customer] = await tx
      .select({
        id: customers.id,
      })
      .from(customers)
      .where(and(eq(customers.id, parsed.customerId), eq(customers.storeId, storeId)))
      .limit(1);

    if (!customer) {
      throw new Error("Không tìm thấy khách hàng");
    }

    const quantityByProduct = new Map<string, number>();
    for (const item of parsed.items) {
      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const productIds = Array.from(quantityByProduct.keys());

    const productRows = await tx
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        salePrice: products.salePrice,
        variants: products.variants,
        costPrice: products.costPrice,
        currentStock: products.currentStock,
      })
      .from(products)
      .where(and(eq(products.storeId, storeId), inArray(products.id, productIds)));

    const productMap = new Map(productRows.map((row) => [row.id, row]));

    const stockIssues: SalesOrderStockIssue[] = [];
    for (const [productId, requestedQuantity] of quantityByProduct.entries()) {
      const product = productMap.get(productId);

      if (!product) {
        stockIssues.push({
          productId,
          sku: "-",
          name: "Sản phẩm không tồn tại",
          requestedQuantity,
          availableStock: 0,
        });
        continue;
      }

      if (requestedQuantity > product.currentStock) {
        stockIssues.push({
          productId,
          sku: product.sku,
          name: product.name,
          requestedQuantity,
          availableStock: product.currentStock,
        });
      }
    }

    if (stockIssues.length > 0) {
      return {
        success: false as const,
        code: "OUT_OF_STOCK" as const,
        stockIssues,
      };
    }

    const adjustedRows = [] as { productId: string; availableStock: number }[];

    for (const [productId, requestedQuantity] of quantityByProduct.entries()) {
      const adjusted = await tx
        .update(products)
        .set({
          currentStock: sql`${products.currentStock} - ${requestedQuantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(products.id, productId),
            eq(products.storeId, storeId),
            sql`${products.currentStock} >= ${requestedQuantity}`,
          ),
        )
        .returning({
          id: products.id,
          currentStock: products.currentStock,
        });

      if (!adjusted[0]) {
        const product = productMap.get(productId);
        return {
          success: false as const,
          code: "OUT_OF_STOCK" as const,
          stockIssues: [
            {
              productId,
              sku: product?.sku ?? "-",
              name: product?.name ?? "Sản phẩm",
              requestedQuantity,
              availableStock: product?.currentStock ?? 0,
            },
          ],
        };
      }

      adjustedRows.push({
        productId,
        availableStock: adjusted[0].currentStock,
      });
    }

    const resolvedItems = parsed.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const productVariants = normalizeProductVariants(product.variants);

      const selectedVariants: SelectedVariant[] = item.selectedVariants
        .map((selected) => {
          const group = productVariants.find((variant) => variant.id === selected.groupId);
          if (!group) return null;

          const value = group.values.find((variantValue) => variantValue.id === selected.valueId);
          if (!value) return null;

          return {
            groupId: group.id,
            groupName: group.name,
            valueId: value.id,
            valueLabel: value.label,
            priceAdjustment: value.priceAdjustment,
          };
        })
        .filter((variant): variant is SelectedVariant => Boolean(variant));

      const unitPrice = calculateVariantAdjustedPrice(product.salePrice, selectedVariants);
      const lineTotal = Number(unitPrice) * item.quantity;

      return {
        ...item,
        product,
        selectedVariants,
        unitPrice,
        lineTotal,
      };
    });

    const subtotalAmountNumber = resolvedItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );

    const discountAmountNumber = Number(parsed.discountAmount ?? "0");
    const totalAmountNumber = subtotalAmountNumber - discountAmountNumber;
    const paidAmountNumber =
      Number(parsed.paidAmount ?? "0") > 0
        ? Number(parsed.paidAmount)
        : totalAmountNumber;

    const [orderCountRow] = await tx
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(salesOrders)
      .where(eq(salesOrders.storeId, storeId));

    const orderCode = buildOrderCode((orderCountRow?.count ?? 0) + 1);

    const [createdOrder] = await tx
      .insert(salesOrders)
      .values({
        storeId,
        orderCode,
        customerId: parsed.customerId,
        status: "processing",
        subtotalAmount: numericToString(subtotalAmountNumber),
        discountAmount: numericToString(discountAmountNumber),
        totalAmount: numericToString(totalAmountNumber),
        paidAmount: numericToString(paidAmountNumber),
        paymentMethod: parsed.paymentMethod,
        note: parsed.note?.trim() || null,
        soldBy: user?.id ?? null,
        soldAt: new Date(),
        statusChangedAt: new Date(),
        statusChangedBy: user?.id ?? null,
        updatedAt: new Date(),
      })
      .returning({
        id: salesOrders.id,
        orderCode: salesOrders.orderCode,
      });

    await tx.insert(salesOrderItems).values(
      resolvedItems.map((item) => {
        return {
          orderId: createdOrder.id,
          productId: item.productId,
          skuSnapshot: item.product.sku,
          nameSnapshot: item.product.name,
          selectedVariants: item.selectedVariants,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: numericToString(item.lineTotal),
        };
      }),
    );

    await tx.insert(salesOrderStatusLogs).values({
      orderId: createdOrder.id,
      fromStatus: "processing",
      toStatus: "processing",
      reason: "Đơn bán được tạo mới",
      changedBy: user?.id ?? null,
      changedAt: new Date(),
    });

    await tx.insert(inventoryTransactions).values(
      parsed.items.map((item) => {
        const product = productMap.get(item.productId)!;

        return {
          storeId,
          productId: item.productId,
          type: "export",
          quantity: -item.quantity,
          unitCost: product.costPrice,
          note: `Xuất kho cho đơn bán ${orderCode}`,
          referenceType: "sales_order",
          referenceId: createdOrder.id,
          createdBy: user?.id ?? null,
        };
      }),
    );

    revalidatePath("/sales");
    revalidatePath("/sales/orders");
    revalidatePath(`/sales/orders/${createdOrder.id}`);

    return {
      success: true as const,
      orderId: createdOrder.id,
      orderCode: createdOrder.orderCode,
      stockAdjustments: adjustedRows,
    };
  });
}
