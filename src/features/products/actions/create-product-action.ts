"use server";

import { createProduct } from "@/features/products/queries/create-product";
import { createProductImages } from "@/features/products/queries/create-product-images";
import { uploadProductImage } from "@/features/products/lib/upload-product-image";
import { createAutoInventoryCheckFromStockChange } from "@/features/inventory-checks/services/create-auto-inventory-check-from-stock-change";
import { createClient } from "@/lib/supabase/server";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/schemas/product-form-schema";
import { normalizeProductVariants } from "@/features/products/variant-utils";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export async function createProductAction(values: ProductFormValues) {
  const parsed = productFormSchema.parse(values);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const product = await createProduct({
    storeId: DEMO_STORE_ID,
    sku: parsed.sku,
    barcode: parsed.barcode ?? null,
    name: parsed.name,
    categoryId: parsed.categoryId ?? null,
    brandId: parsed.brandId ?? null,
    locationId: parsed.locationId ?? null,
    costPrice: parsed.costPrice,
    salePrice: parsed.salePrice,
    variants: normalizeProductVariants(parsed.variants),
    currentStock: parsed.currentStock,
    minStockAlert: parsed.minStockAlert,
    maxStockAlert: parsed.maxStockAlert,
    weightValue: parsed.weightValue,
    weightUnit: parsed.weightUnit,
    description: parsed.description ?? null,
    orderNote: parsed.orderNote ?? null,
    status: parsed.status,
  });

  const uploadedImages: {
    imageUrl: string;
    sortOrder: number;
    isPrimary: boolean;
  }[] = [];

  for (let i = 0; i < parsed.images.length; i++) {
    const item = parsed.images[i];

    if (item.file instanceof File) {
      const uploaded = await uploadProductImage(item.file);

      uploadedImages.push({
        imageUrl: uploaded.publicUrl,
        sortOrder: item.sortOrder ?? i,
        isPrimary: item.isPrimary ?? i === 0,
      });
      continue;
    }

    if (item.imageUrl) {
      uploadedImages.push({
        imageUrl: item.imageUrl,
        sortOrder: item.sortOrder ?? i,
        isPrimary: item.isPrimary ?? i === 0,
      });
    }
  }

  if (uploadedImages.length > 0) {
    await createProductImages(
      uploadedImages.map((item) => ({
        productId: product.id,
        imageUrl: item.imageUrl,
        sortOrder: item.sortOrder,
        isPrimary: item.isPrimary,
      })),
    );
  }

  if (parsed.currentStock > 0) {
    await createAutoInventoryCheckFromStockChange({
      storeId: DEMO_STORE_ID,
      productId: product.id,
      sku: parsed.sku,
      productName: parsed.name,
      beforeStock: 0,
      afterStock: parsed.currentStock,
      unitCost: parsed.costPrice,
      actorProfileId: user?.id ?? null,
      note: `Phiếu kiểm kho được tạo tự động khi tạo Hàng hóa ${parsed.name}`,
    });
  }

  return { id: product.id };
}
