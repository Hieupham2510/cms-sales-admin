"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { getActiveStoreIdOrThrow, requireAdminContext } from "@/features/auth/queries/get-auth-context";
import { and, asc, eq } from "drizzle-orm";

export async function listLocationsAction() {
  const storeId = await getActiveStoreIdOrThrow();

  return db
    .select({
      id: locations.id,
      name: locations.name,
      code: locations.code,
    })
    .from(locations)
    .where(eq(locations.storeId, storeId))
    .orderBy(asc(locations.name));
}

export async function createLocationAction(input: {
  name: string;
  code?: string;
}) {
  const storeId = await getActiveStoreIdOrThrow();
  const name = input.name.trim();
  const code = input.code?.trim() || null;

  if (!name) {
    throw new Error("Tên vị trí là bắt buộc");
  }

  const result = await db
    .insert(locations)
    .values({
      storeId,
      name,
      code,
      description: null,
    })
    .returning({
      id: locations.id,
      name: locations.name,
      code: locations.code,
    });

  revalidatePath("/products");
  return {
    id: result[0].id,
    name: result[0].name,
  };
}

export async function updateLocationAction(input: {
  id: string;
  name: string;
  code?: string;
}) {
  const storeId = await getActiveStoreIdOrThrow();
  const name = input.name.trim();
  const code = input.code?.trim() || null;

  if (!name) {
    throw new Error("Tên vị trí là bắt buộc");
  }

  const result = await db
    .update(locations)
    .set({
      name,
      code,
      updatedAt: new Date(),
    })
    .where(
      and(eq(locations.id, input.id), eq(locations.storeId, storeId)),
    )
    .returning({
      id: locations.id,
      name: locations.name,
      code: locations.code,
    });

  if (!result[0]) return null;

  return {
    id: result[0].id,
    name: result[0].name,
  };
}

export async function deleteLocationAction(input: { id: string }) {
  const auth = await requireAdminContext();
  const storeId = auth.activeStoreId;
  if (!storeId) {
    throw new Error("Tài khoản chưa được gán cửa hàng");
  }
  await db
    .delete(locations)
    .where(
      and(eq(locations.id, input.id), eq(locations.storeId, storeId)),
    );

  revalidatePath("/products");
  return { success: true };
}
