"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { requireAdminContext } from "@/features/auth/queries/get-auth-context";
import { createClient } from "@/lib/supabase/server";

function extractProductImagePath(publicUrl: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex < 0) return null;

  const path = publicUrl.slice(markerIndex + marker.length).trim();
  return path || null;
}

function isForeignKeyViolation(error: unknown) {
  const maybe = error as {
    code?: string;
    message?: string;
    cause?: { code?: string; message?: string };
  } | null;

  const code = maybe?.code ?? maybe?.cause?.code;
  const message = String(maybe?.message ?? maybe?.cause?.message ?? "");

  if (code === "23503") return true;

  return (
    message.includes("foreign key constraint") ||
    message.includes("violates foreign key") ||
    message.includes('update or delete on table "products"')
  );
}

export async function deleteProductAction(productId: string) {
  const auth = await requireAdminContext();
  const storeId = auth.activeStoreId;
  if (!storeId) {
    throw new Error("Tài khoản chưa được gán cửa hàng");
  }
  const supabase = await createClient();

  const product = await db
    .select({
      id: products.id,
    })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.storeId, storeId)))
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

  try {
    await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)));
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new Error(
        "Không thể xóa sản phẩm đã phát sinh đơn bán hoặc giao dịch liên quan. Hãy chuyển trạng thái ngừng bán thay vì xóa.",
      );
    }
    throw error;
  }

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
