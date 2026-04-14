"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { requireAuthContext } from "@/features/auth/queries/get-auth-context";

export async function deleteStoreAction(input: { id: string }) {
  const auth = await requireAuthContext();
  if (auth.role !== "admin") {
    throw new Error("Chỉ quản trị viên mới được xóa cửa hàng");
  }

  const storeId = input.id?.trim();
  if (!storeId) {
    throw new Error("ID cửa hàng không hợp lệ");
  }

  const storeCountRows = await db.select({ id: stores.id }).from(stores);
  if (storeCountRows.length <= 1) {
    throw new Error("Không thể xóa cửa hàng cuối cùng");
  }

  const deletedRows = await db
    .delete(stores)
    .where(eq(stores.id, storeId))
    .returning({ id: stores.id });

  if (deletedRows.length === 0) {
    throw new Error("Không tìm thấy cửa hàng để xóa");
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");

  return { success: true };
}

