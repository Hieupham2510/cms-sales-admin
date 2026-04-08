"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACTIVE_STORE_COOKIE } from "@/features/auth/constants";
import { requireAuthContext } from "@/features/auth/queries/get-auth-context";

export async function switchActiveStoreAction(storeId: string) {
  const auth = await requireAuthContext();

  if (auth.role !== "admin") {
    throw new Error("Chỉ quản trị viên mới được chuyển cửa hàng");
  }

  const hasAccess = auth.allowedStores.some((store) => store.id === storeId);
  if (!hasAccess) {
    throw new Error("Bạn không có quyền truy cập cửa hàng này");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_STORE_COOKIE, storeId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/", "layout");

  return { success: true };
}
