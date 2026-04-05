import { db } from "@/db";
import { inventoryCheckItems, inventoryChecks, productImages, profiles } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { formatInventoryCheckCode } from "@/features/inventory-checks/lib/format-check-code";

type Params = {
  id: string;
  storeId: string;
};

export async function getInventoryCheckById(params: Params) {
  const headerRows = await db
    .select({
      id: inventoryChecks.id,
      codeNo: inventoryChecks.codeNo,
      storeId: inventoryChecks.storeId,
      status: inventoryChecks.status,
      note: inventoryChecks.note,
      actualQuantityTotal: inventoryChecks.actualQuantityTotal,
      actualValueTotal: inventoryChecks.actualValueTotal,
      totalDiffQuantity: inventoryChecks.totalDiffQuantity,
      increaseDiffQuantity: inventoryChecks.increaseDiffQuantity,
      decreaseDiffQuantity: inventoryChecks.decreaseDiffQuantity,
      createdAt: inventoryChecks.createdAt,
      balancedAt: inventoryChecks.balancedAt,
      createdBy: inventoryChecks.createdBy,
      balancedBy: inventoryChecks.balancedBy,
      createdByName: profiles.fullName,
    })
    .from(inventoryChecks)
    .leftJoin(profiles, eq(inventoryChecks.createdBy, profiles.id))
    .where(and(eq(inventoryChecks.id, params.id), eq(inventoryChecks.storeId, params.storeId)))
    .limit(1);

  const header = headerRows[0];
  if (!header) return null;

  const items = await db
    .select({
      id: inventoryCheckItems.id,
      checkId: inventoryCheckItems.checkId,
      productId: inventoryCheckItems.productId,
      sku: inventoryCheckItems.sku,
      productName: inventoryCheckItems.productName,
      bookStock: inventoryCheckItems.bookStock,
      actualStock: inventoryCheckItems.actualStock,
      diffQuantity: inventoryCheckItems.diffQuantity,
      unitCost: inventoryCheckItems.unitCost,
      diffValue: inventoryCheckItems.diffValue,
      createdAt: inventoryCheckItems.createdAt,
    })
    .from(inventoryCheckItems)
    .where(eq(inventoryCheckItems.checkId, header.id));

  const itemsWithThumbnail = await Promise.all(
    items.map(async (item) => {
      const imageRows = await db
        .select({
          imageUrl: productImages.imageUrl,
        })
        .from(productImages)
        .where(eq(productImages.productId, item.productId))
        .orderBy(desc(productImages.isPrimary), desc(productImages.sortOrder), desc(productImages.createdAt))
        .limit(1);

      return {
        ...item,
        thumbnailUrl: imageRows[0]?.imageUrl ?? null,
      };
    }),
  );

  const firstItem = itemsWithThumbnail[0];

  let canCancel = false;
  if (firstItem) {
    const latestForProductRows = await db
      .select({
        id: inventoryChecks.id,
      })
      .from(inventoryChecks)
      .innerJoin(
        inventoryCheckItems,
        eq(inventoryChecks.id, inventoryCheckItems.checkId),
      )
      .where(
        and(
          eq(inventoryChecks.storeId, params.storeId),
          eq(inventoryCheckItems.productId, firstItem.productId),
        ),
      )
      .orderBy(desc(inventoryChecks.codeNo), desc(inventoryChecks.createdAt))
      .limit(1);

    canCancel = latestForProductRows[0]?.id === header.id;
  }

  return {
    ...header,
    code: formatInventoryCheckCode(header.codeNo),
    canCancel,
    items: itemsWithThumbnail,
  };
}
