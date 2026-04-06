import { db } from "@/db";
import {
  brands,
  categories,
  locations,
  productImages,
  products,
} from "@/db/schema";
import { asc, desc, eq, ilike, or, and, inArray } from "drizzle-orm";

type GetProductsParams = {
  storeId: string;
  search?: string;
  status?: string;
  categoryId?: string;
  sortBy?: "name" | "createdAt" | "updatedAt" | "currentStock";
  sortOrder?: "asc" | "desc";
};

export async function getProducts(params: GetProductsParams) {
  const {
    storeId,
    search,
    status,
    categoryId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const conditions = [eq(products.storeId, storeId)];

  if (search?.trim()) {
    const keyword = `%${search.trim()}%`;

    conditions.push(
      or(
        ilike(products.name, keyword),
        ilike(products.sku, keyword),
        ilike(products.barcode, keyword),
      )!,
    );
  }

  if (status?.trim()) {
    conditions.push(eq(products.status, status));
  }

  if (categoryId?.trim()) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  const orderColumn =
    sortBy === "name"
      ? products.name
      : sortBy === "updatedAt"
        ? products.updatedAt
        : sortBy === "currentStock"
          ? products.currentStock
          : products.createdAt;

  const orderBy = sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

  const rows = await db
    .select({
      id: products.id,
      storeId: products.storeId,
      categoryId: products.categoryId,
      brandId: products.brandId,
      locationId: products.locationId,
      sku: products.sku,
      barcode: products.barcode,
      name: products.name,
      costPrice: products.costPrice,
      salePrice: products.salePrice,
      variants: products.variants,
      currentStock: products.currentStock,
      minStockAlert: products.minStockAlert,
      maxStockAlert: products.maxStockAlert,
      weightValue: products.weightValue,
      weightUnit: products.weightUnit,
      description: products.description,
      orderNote: products.orderNote,
      status: products.status,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
      brandName: brands.name,
      locationName: locations.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(locations, eq(products.locationId, locations.id))
    .where(and(...conditions))
    .orderBy(orderBy);

  if (rows.length === 0) {
    return [];
  }

  const productIds = rows.map((item) => item.id);

  const imageRows = await db
    .select({
      productId: productImages.productId,
      imageUrl: productImages.imageUrl,
      sortOrder: productImages.sortOrder,
      isPrimary: productImages.isPrimary,
      createdAt: productImages.createdAt,
    })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(
      desc(productImages.isPrimary),
      asc(productImages.sortOrder),
      asc(productImages.createdAt),
    );

  const firstImageMap = new Map<string, string>();

  for (const image of imageRows) {
    if (!firstImageMap.has(image.productId)) {
      firstImageMap.set(image.productId, image.imageUrl);
    }
  }

  return rows.map((item) => ({
    ...item,
    thumbnailUrl: firstImageMap.get(item.id) ?? null,
  }));
}
