"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { requireAdminContext } from "@/features/auth/queries/get-auth-context";

export async function deleteCustomerAction(customerId: string) {
  const auth = await requireAdminContext();
  const storeId = auth.activeStoreId;
  if (!storeId) {
    throw new Error("Tài khoản chưa được gán cửa hàng");
  }
  await db
    .delete(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)));

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}
