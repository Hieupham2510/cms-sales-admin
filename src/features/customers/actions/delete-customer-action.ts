"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { customers } from "@/db/schema";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export async function deleteCustomerAction(customerId: string) {
  await db
    .delete(customers)
    .where(and(eq(customers.id, customerId), eq(customers.storeId, DEMO_STORE_ID)));

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}
