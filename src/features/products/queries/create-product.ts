import { db } from "@/db";
import { products } from "@/db/schema";
import type { ProductVariantGroup } from "@/features/products/variant-utils";

export type CreateProductInput = {
  storeId: string;
  categoryId?: string | null;
  brandId?: string | null;
  locationId?: string | null;
  sku: string;
  barcode?: string | null;
  name: string;
  costPrice: string;
  salePrice: string;
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

export async function createProduct(input: CreateProductInput) {
  const result = await db
    .insert(products)
    .values({
      storeId: input.storeId,
      categoryId: input.categoryId ?? null,
      brandId: input.brandId ?? null,
      locationId: input.locationId ?? null,
      sku: input.sku,
      barcode: input.barcode ?? null,
      name: input.name,
      costPrice: input.costPrice,
      salePrice: input.salePrice,
      variants: input.variants ?? [],
      currentStock: input.currentStock ?? 0,
      minStockAlert: input.minStockAlert ?? 0,
      maxStockAlert: input.maxStockAlert ?? 0,
      weightValue: input.weightValue ?? "0",
      weightUnit: input.weightUnit ?? "g",
      description: input.description ?? null,
      orderNote: input.orderNote ?? null,
      status: input.status ?? "active",
    })
    .returning();

  return result[0];
}
