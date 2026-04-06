import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { ProductVariantGroup } from "@/features/products/variant-utils";

export type UpdateProductInput = {
  id: string;
  storeId: string;
  categoryId?: string | null;
  brandId?: string | null;
  locationId?: string | null;
  sku?: string;
  barcode?: string | null;
  name?: string;
  costPrice?: string;
  salePrice?: string;
  variants?: ProductVariantGroup[];
  currentStock?: number;
  minStockAlert?: number;
  maxStockAlert?: number;
  weightValue?: string;
  weightUnit?: string;
  description?: string | null;
  orderNote?: string | null;
  status?: string;
};

export async function updateProduct(input: UpdateProductInput) {
  const result = await db
    .update(products)
    .set({
      categoryId: input.categoryId,
      brandId: input.brandId,
      locationId: input.locationId,
      sku: input.sku,
      barcode: input.barcode,
      name: input.name,
      costPrice: input.costPrice,
      salePrice: input.salePrice,
      variants: input.variants,
      currentStock: input.currentStock,
      minStockAlert: input.minStockAlert,
      maxStockAlert: input.maxStockAlert,
      weightValue: input.weightValue,
      weightUnit: input.weightUnit,
      description: input.description,
      orderNote: input.orderNote,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, input.id), eq(products.storeId, input.storeId)))
    .returning();

  return result[0] ?? null;
}
