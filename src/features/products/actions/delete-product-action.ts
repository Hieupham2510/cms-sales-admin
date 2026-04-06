"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

function extractProductImagePath(publicUrl: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex < 0) return null;

  const path = publicUrl.slice(markerIndex + marker.length).trim();
  return path || null;
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient();

  const product = await db
    .select({
      id: products.id,
    })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.storeId, DEMO_STORE_ID)))
    .limit(1);

  if (!product[0]) {
    throw new Error("Không tìm thấy sản phẩm để xóa");
  }

  const images = await db
    .select({
      imageUrl: productImages.imageUrl,
    })
    .from(productImages)
    .where(eq(productImages.productId, productId));

  await db
    .delete(products)
    .where(and(eq(products.id, productId), eq(products.storeId, DEMO_STORE_ID)));

  const removablePaths = images
    .map((item) => extractProductImagePath(item.imageUrl))
    .filter((path): path is string => Boolean(path));

  if (removablePaths.length > 0) {
    await supabase.storage.from("product-images").remove(removablePaths);
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);

  return { success: true };
}
