import type { ProductVariantGroup } from "@/features/products/variant-utils";

export type ProductImageItem = {
  id: string;
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt?: Date;
};

export type ProductDetail = {
  id: string;
  storeId: string;

  categoryId: string | null;
  brandId: string | null;
  locationId: string | null;

  sku: string;
  barcode: string | null;
  name: string;

  costPrice: string;
  salePrice: string;
  variants: ProductVariantGroup[];

  currentStock: number;
  minStockAlert: number;
  maxStockAlert: number;

  weightValue: string | null;
  weightUnit: string;

  description: string | null;
  orderNote: string | null;

  status: string;

  createdAt: Date;
  updatedAt: Date;

  categoryName: string | null;
  brandName: string | null;
  locationName: string | null;

  images: ProductImageItem[];
};

export type ProductRow = {
  id: string;
  storeId: string;

  categoryId: string | null;
  brandId: string | null;
  locationId: string | null;

  sku: string;
  barcode: string | null;
  name: string;

  costPrice: string;
  salePrice: string;
  variants: ProductVariantGroup[];

  currentStock: number;
  minStockAlert: number;
  maxStockAlert: number;

  weightValue: string | null;
  weightUnit: string;

  description: string | null;
  orderNote: string | null;

  status: string;

  createdAt: Date;
  updatedAt: Date;

  categoryName: string | null;
  brandName: string | null;
  locationName: string | null;

  thumbnailUrl: string | null;
  customerOrderQuantity: number;
};
