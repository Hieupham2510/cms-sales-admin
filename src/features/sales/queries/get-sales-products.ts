import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";

type Params = {
  storeId: string;
  search?: string;
  limit?: number;
};

export async function getSalesProducts(params: Params) {
  const limit = Math.min(Math.max(params.limit ?? 120, 1), 300);
  const conditions = [eq(products.storeId, params.storeId)];

  if (params.search?.trim()) {
    const keyword = `%${params.search.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, keyword),
        ilike(products.sku, keyword),
        ilike(products.barcode, keyword),
      )!,
    );
  }

  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      salePrice: products.salePrice,
      variants: products.variants,
      currentStock: products.currentStock,
      status: products.status,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.createdAt), asc(products.name))
    .limit(limit);

  if (rows.length === 0) return [];

  const imageRows = await db
    .select({
      productId: productImages.productId,
      imageUrl: productImages.imageUrl,
      isPrimary: productImages.isPrimary,
      sortOrder: productImages.sortOrder,
      createdAt: productImages.createdAt,
    })
    .from(productImages)
    .where(inArray(productImages.productId, rows.map((item) => item.id)))
    .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder), asc(productImages.createdAt));

  const thumbnailMap = new Map<string, string>();
  for (const row of imageRows) {
    if (!thumbnailMap.has(row.productId)) {
      thumbnailMap.set(row.productId, row.imageUrl);
    }
  }

  return rows.map((row) => ({
    ...row,
    thumbnailUrl: thumbnailMap.get(row.id) ?? null,
  }));
}
