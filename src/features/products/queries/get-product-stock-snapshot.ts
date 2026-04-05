import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type Params = {
  id: string;
  storeId: string;
};

export async function getProductStockSnapshot(params: Params) {
  const rows = await db
    .select({
      id: products.id,
      storeId: products.storeId,
      sku: products.sku,
      name: products.name,
      currentStock: products.currentStock,
      costPrice: products.costPrice,
    })
    .from(products)
    .where(and(eq(products.id, params.id), eq(products.storeId, params.storeId)))
    .limit(1);

  return rows[0] ?? null;
}
