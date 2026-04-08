import { db } from "@/db";
import {
  brands,
  categories,
  locations,
  productImages,
  products,
  salesOrderItems,
  salesOrders,
} from "@/db/schema";
import { asc, desc, eq, ilike, or, and, inArray, gte, lte } from "drizzle-orm";

type StockState = "out" | "low" | "ok" | "high";

type GetProductsParams = {
  storeId: string;
  search?: string;
  status?: string;
  categoryId?: string;
  brandId?: string;
  locationId?: string;
  salePriceMin?: number;
  salePriceMax?: number;
  costPriceMin?: number;
  costPriceMax?: number;
  currentStockMin?: number;
  currentStockMax?: number;
  customerOrderQuantityMin?: number;
  customerOrderQuantityMax?: number;
  stockStates?: StockState[];
  sortBy?: "name" | "createdAt" | "updatedAt" | "currentStock";
  sortOrder?: "asc" | "desc";
};

function getStockState(item: {
  status: string;
  currentStock: number;
  minStockAlert: number;
  maxStockAlert: number;
}): StockState {
  if (item.currentStock <= 0) return "out";
  if (item.currentStock <= item.minStockAlert) return "low";
  if (item.currentStock > item.maxStockAlert) return "high";
  return "ok";
}

export async function getProducts(params: GetProductsParams) {
  const {
    storeId,
    search,
    status,
    categoryId,
    brandId,
    locationId,
    salePriceMin,
    salePriceMax,
    costPriceMin,
    costPriceMax,
    currentStockMin,
    currentStockMax,
    customerOrderQuantityMin,
    customerOrderQuantityMax,
    stockStates = [],
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

  if (brandId?.trim()) {
    conditions.push(eq(products.brandId, brandId));
  }

  if (locationId?.trim()) {
    conditions.push(eq(products.locationId, locationId));
  }

  if (salePriceMin !== undefined) {
    conditions.push(gte(products.salePrice, String(salePriceMin)));
  }

  if (salePriceMax !== undefined) {
    conditions.push(lte(products.salePrice, String(salePriceMax)));
  }

  if (costPriceMin !== undefined) {
    conditions.push(gte(products.costPrice, String(costPriceMin)));
  }

  if (costPriceMax !== undefined) {
    conditions.push(lte(products.costPrice, String(costPriceMax)));
  }

  if (currentStockMin !== undefined) {
    conditions.push(gte(products.currentStock, currentStockMin));
  }

  if (currentStockMax !== undefined) {
    conditions.push(lte(products.currentStock, currentStockMax));
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

  const pendingOrderItemRows = await db
    .select({
      productId: salesOrderItems.productId,
      quantity: salesOrderItems.quantity,
    })
    .from(salesOrderItems)
    .innerJoin(salesOrders, eq(salesOrderItems.orderId, salesOrders.id))
    .where(
      and(
        eq(salesOrders.storeId, storeId),
        eq(salesOrders.status, "completed"),
        inArray(salesOrderItems.productId, productIds),
      ),
    );

  const customerOrderQuantityMap = new Map<string, number>();
  for (const row of pendingOrderItemRows) {
    customerOrderQuantityMap.set(
      row.productId,
      (customerOrderQuantityMap.get(row.productId) ?? 0) + row.quantity,
    );
  }

  const mappedRows = rows.map((item) => ({
    ...item,
    thumbnailUrl: firstImageMap.get(item.id) ?? null,
    customerOrderQuantity: customerOrderQuantityMap.get(item.id) ?? 0,
  }));

  return mappedRows.filter((item) => {
    if (stockStates.length > 0 && !stockStates.includes(getStockState(item))) {
      return false;
    }

    if (
      customerOrderQuantityMin !== undefined &&
      item.customerOrderQuantity < customerOrderQuantityMin
    ) {
      return false;
    }

    if (
      customerOrderQuantityMax !== undefined &&
      item.customerOrderQuantity > customerOrderQuantityMax
    ) {
      return false;
    }

    return true;
  });
}
