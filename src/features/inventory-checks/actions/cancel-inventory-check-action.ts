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
import { requireAdminContext } from "@/features/auth/queries/get-auth-context";

export async function cancelInventoryCheckAction(checkId: string) {
  const auth = await requireAdminContext();
  const storeId = auth.activeStoreId;
  if (!storeId) {
    throw new Error("Tài khoản chưa được gán cửa hàng");
  }
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
    .where(and(eq(inventoryChecks.id, checkId), eq(inventoryChecks.storeId, storeId)))
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
        eq(inventoryChecks.storeId, storeId),
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
      .where(and(eq(products.id, check.productId), eq(products.storeId, storeId)));

    await tx
      .delete(inventoryTransactions)
      .where(
        and(
          eq(inventoryTransactions.storeId, storeId),
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
