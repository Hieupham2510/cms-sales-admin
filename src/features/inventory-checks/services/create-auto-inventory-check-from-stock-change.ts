"use server";

import { db } from "@/db";
import { inventoryCheckItems, inventoryChecks, inventoryTransactions } from "@/db/schema";

type Input = {
  storeId: string;
  productId: string;
  sku: string;
  productName: string;
  beforeStock: number;
  afterStock: number;
  unitCost: string;
  actorProfileId?: string | null;
  note?: string | null;
};

function toNumericString(value: number) {
  return value.toFixed(2);
}

export async function createAutoInventoryCheckFromStockChange(input: Input) {
  if (input.beforeStock === input.afterStock) {
    return null;
  }

  const diffQuantity = input.afterStock - input.beforeStock;
  const unitCostValue = Number(input.unitCost || "0");
  const diffValue = diffQuantity * unitCostValue;
  const actualValue = input.afterStock * unitCostValue;

  const finalNote =
    input.note?.trim() ||
    `Phiếu kiểm kho được tạo tự động khi cập nhật Hàng hóa ${input.productName}`;

  return db.transaction(async (tx) => {
    const createdCheckRows = await tx
      .insert(inventoryChecks)
      .values({
        storeId: input.storeId,
        status: "balanced",
        note: finalNote,
        actualQuantityTotal: input.afterStock,
        actualValueTotal: toNumericString(actualValue),
        totalDiffQuantity: diffQuantity,
        increaseDiffQuantity: diffQuantity > 0 ? diffQuantity : 0,
        decreaseDiffQuantity: diffQuantity < 0 ? Math.abs(diffQuantity) : 0,
        createdBy: input.actorProfileId ?? null,
        balancedBy: input.actorProfileId ?? null,
      })
      .returning({
        id: inventoryChecks.id,
        codeNo: inventoryChecks.codeNo,
      });

    const createdCheck = createdCheckRows[0];

    await tx.insert(inventoryCheckItems).values({
      checkId: createdCheck.id,
      productId: input.productId,
      sku: input.sku,
      productName: input.productName,
      bookStock: input.beforeStock,
      actualStock: input.afterStock,
      diffQuantity,
      unitCost: input.unitCost,
      diffValue: toNumericString(diffValue),
    });

    await tx.insert(inventoryTransactions).values({
      storeId: input.storeId,
      productId: input.productId,
      type: "adjustment",
      quantity: diffQuantity,
      unitCost: input.unitCost,
      note: finalNote,
      referenceType: "inventory_check",
      referenceId: createdCheck.id,
      createdBy: input.actorProfileId ?? null,
    });

    return createdCheck;
  });
}
