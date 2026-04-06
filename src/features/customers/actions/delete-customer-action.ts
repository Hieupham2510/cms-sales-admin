"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";

export async function deleteCustomerAction(customerId: string) {
  const storeId = await getActiveStoreIdOrThrow();
  await db
    .delete(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, storeId)));

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}
