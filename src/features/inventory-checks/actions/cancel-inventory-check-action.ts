"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  inventoryCheckItems,
  inventoryChecks,
  inventoryTransactions,
  products,
} from "@/db/schema";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export async function cancelInventoryCheckAction(checkId: string) {
  const checkRows = await db
    .select({
      checkId: inventoryChecks.id,
      storeId: inventoryChecks.storeId,
      codeNo: inventoryChecks.codeNo,
      itemId: inventoryCheckItems.id,
      productId: inventoryCheckItems.productId,
      bookStock: inventoryCheckItems.bookStock,
    })
    .from(inventoryChecks)
    .innerJoin(inventoryCheckItems, eq(inventoryChecks.id, inventoryCheckItems.checkId))
    .where(and(eq(inventoryChecks.id, checkId), eq(inventoryChecks.storeId, DEMO_STORE_ID)))
    .limit(1);

  const check = checkRows[0];
  if (!check) {
    throw new Error("Phiếu kiểm kho không tồn tại");
  }

  const latestRows = await db
    .select({
      id: inventoryChecks.id,
      codeNo: inventoryChecks.codeNo,
    })
    .from(inventoryChecks)
    .innerJoin(inventoryCheckItems, eq(inventoryChecks.id, inventoryCheckItems.checkId))
    .where(
      and(
        eq(inventoryChecks.storeId, DEMO_STORE_ID),
        eq(inventoryCheckItems.productId, check.productId),
      ),
    )
    .orderBy(desc(inventoryChecks.codeNo), desc(inventoryChecks.createdAt))
    .limit(1);

  if (latestRows[0]?.id !== check.checkId) {
    throw new Error("Chỉ có thể hủy phiếu kiểm kho mới nhất của sản phẩm");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({
        currentStock: check.bookStock,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, check.productId), eq(products.storeId, DEMO_STORE_ID)));

    await tx
      .delete(inventoryTransactions)
      .where(
        and(
          eq(inventoryTransactions.storeId, DEMO_STORE_ID),
          eq(inventoryTransactions.referenceType, "inventory_check"),
          eq(inventoryTransactions.referenceId, check.checkId),
        ),
      );

    await tx.delete(inventoryCheckItems).where(eq(inventoryCheckItems.checkId, check.checkId));
    await tx.delete(inventoryChecks).where(eq(inventoryChecks.id, check.checkId));
  });

  revalidatePath("/inventory/adjustments");
  revalidatePath("/products");
  revalidatePath(`/products/${check.productId}`);

  return { success: true };
}
