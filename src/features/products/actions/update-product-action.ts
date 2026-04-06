"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productImages } from "@/db/schema";
import { updateProduct } from "@/features/products/queries/update-product";
import { getProductStockSnapshot } from "@/features/products/queries/get-product-stock-snapshot";
import { createProductImages } from "@/features/products/queries/create-product-images";
import { uploadProductImage } from "@/features/products/lib/upload-product-image";
import { createAutoInventoryCheckFromStockChange } from "@/features/inventory-checks/services/create-auto-inventory-check-from-stock-change";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { createClient } from "@/lib/supabase/server";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/schemas/product-form-schema";
import { normalizeProductVariants } from "@/features/products/variant-utils";

function extractProductImagePath(publicUrl: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex < 0) return null;

  const path = publicUrl.slice(markerIndex + marker.length).trim();
  return path || null;
}

export async function updateProductAction(
  productId: string,
  values: ProductFormValues,
) {
  const storeId = await getActiveStoreIdOrThrow();
  const parsed = productFormSchema.parse(values);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const beforeSnapshot = await getProductStockSnapshot({
    id: productId,
    storeId,
  });

  if (!beforeSnapshot) {
    throw new Error("Không tìm thấy sản phẩm để cập nhật");
  }

  await updateProduct({
    id: productId,
    storeId,
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

  const finalImages: {
    imageUrl: string;
    sortOrder: number;
    isPrimary: boolean;
  }[] = [];

  for (let i = 0; i < parsed.images.length; i++) {
    const item = parsed.images[i];

    if (item.file instanceof File) {
      const uploaded = await uploadProductImage(item.file);

      finalImages.push({
        imageUrl: uploaded.publicUrl,
        sortOrder: item.sortOrder ?? i,
        isPrimary: item.isPrimary ?? false,
      });
      continue;
    }

    if (item.imageUrl) {
      finalImages.push({
        imageUrl: item.imageUrl,
        sortOrder: item.sortOrder ?? i,
        isPrimary: item.isPrimary ?? false,
      });
    }
  }

  if (finalImages.length > 0 && !finalImages.some((item) => item.isPrimary)) {
    finalImages[0].isPrimary = true;
  }

  const existingImages = await db
    .select({
      imageUrl: productImages.imageUrl,
    })
    .from(productImages)
    .where(eq(productImages.productId, productId));

  await db.delete(productImages).where(eq(productImages.productId, productId));

  if (finalImages.length > 0) {
    await createProductImages(
      finalImages.map((item) => ({
        productId,
        imageUrl: item.imageUrl,
        sortOrder: item.sortOrder,
        isPrimary: item.isPrimary,
      })),
    );
  }

  const existingUrlSet = new Set(existingImages.map((item) => item.imageUrl));
  const finalUrlSet = new Set(finalImages.map((item) => item.imageUrl));
  const removedUrls = Array.from(existingUrlSet).filter(
    (url) => !finalUrlSet.has(url),
  );

  if (removedUrls.length > 0) {
    const removablePaths = removedUrls
      .map((url) => extractProductImagePath(url))
      .filter((path): path is string => Boolean(path));

    if (removablePaths.length > 0) {
      await supabase.storage.from("product-images").remove(removablePaths);
    }
  }

  await createAutoInventoryCheckFromStockChange({
    storeId,
    productId,
    sku: parsed.sku,
    productName: parsed.name,
    beforeStock: beforeSnapshot.currentStock,
    afterStock: parsed.currentStock,
    unitCost: parsed.costPrice,
    actorProfileId: user?.id ?? null,
    note: `Phiếu kiểm kho được tạo tự động khi cập nhật Hàng hóa ${parsed.name}`,
  });

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);

  return { success: true };
}
