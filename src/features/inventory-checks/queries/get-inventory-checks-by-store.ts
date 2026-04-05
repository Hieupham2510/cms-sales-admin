import { db } from "@/db";
import { inventoryCheckItems, inventoryChecks } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { formatInventoryCheckCode } from "@/features/inventory-checks/lib/format-check-code";

export type InventoryCheckListItem = {
  id: string;
  code: string;
  codeNo: number;
  storeId: string;
  productId: string;
  sku: string;
  productName: string;
  status: string;
  note: string | null;
  actualQuantityTotal: number;
  actualValueTotal: string;
  totalDiffQuantity: number;
  totalDiffValue: string;
  increaseDiffQuantity: number;
  decreaseDiffQuantity: number;
  createdAt: Date;
  balancedAt: Date;
  canCancel: boolean;
};

export async function getInventoryChecksByStore(storeId: string) {
  const rows = await db
    .select({
      id: inventoryChecks.id,
      codeNo: inventoryChecks.codeNo,
      storeId: inventoryChecks.storeId,
      productId: inventoryCheckItems.productId,
      sku: inventoryCheckItems.sku,
      productName: inventoryCheckItems.productName,
      status: inventoryChecks.status,
      note: inventoryChecks.note,
      actualQuantityTotal: inventoryChecks.actualQuantityTotal,
      actualValueTotal: inventoryChecks.actualValueTotal,
      totalDiffQuantity: inventoryChecks.totalDiffQuantity,
      totalDiffValue: inventoryCheckItems.diffValue,
      increaseDiffQuantity: inventoryChecks.increaseDiffQuantity,
      decreaseDiffQuantity: inventoryChecks.decreaseDiffQuantity,
      createdAt: inventoryChecks.createdAt,
      balancedAt: inventoryChecks.balancedAt,
    })
    .from(inventoryChecks)
    .innerJoin(inventoryCheckItems, eq(inventoryChecks.id, inventoryCheckItems.checkId))
    .where(and(eq(inventoryChecks.storeId, storeId)))
    .orderBy(desc(inventoryChecks.codeNo), desc(inventoryChecks.createdAt));

  const latestCodeByProductId = new Map<string, number>();
  for (const row of rows) {
    const current = latestCodeByProductId.get(row.productId) ?? 0;
    if (row.codeNo > current) {
      latestCodeByProductId.set(row.productId, row.codeNo);
    }
  }

  return rows.map<InventoryCheckListItem>((row) => ({
    ...row,
    code: formatInventoryCheckCode(row.codeNo),
    canCancel: latestCodeByProductId.get(row.productId) === row.codeNo,
  }));
}
