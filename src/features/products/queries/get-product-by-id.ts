import { db } from "@/db";
import {
  brands,
  categories,
  locations,
  productImages,
  products,
} from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

type Params = {
  id: string;
  storeId: string;
};

export async function getProductById(params: Params) {
  const productResult = await db
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
    .where(and(eq(products.id, params.id), eq(products.storeId, params.storeId)))
    .limit(1);

  const product = productResult[0] ?? null;

  if (!product) return null;

  const images = await db
    .select({
      id: productImages.id,
      imageUrl: productImages.imageUrl,
      sortOrder: productImages.sortOrder,
      isPrimary: productImages.isPrimary,
      createdAt: productImages.createdAt,
    })
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(
      asc(productImages.sortOrder),
      asc(productImages.createdAt),
    );

  return {
    ...product,
    images,
  };
}
