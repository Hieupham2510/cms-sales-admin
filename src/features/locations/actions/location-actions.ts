"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export async function listLocationsAction() {
  return db
    .select({
      id: locations.id,
      name: locations.name,
      code: locations.code,
    })
    .from(locations)
    .where(eq(locations.storeId, DEMO_STORE_ID))
    .orderBy(asc(locations.name));
}

export async function createLocationAction(input: {
  name: string;
  code?: string;
}) {
  const name = input.name.trim();
  const code = input.code?.trim() || null;

  if (!name) {
    throw new Error("Tên vị trí là bắt buộc");
  }

  const result = await db
    .insert(locations)
    .values({
      storeId: DEMO_STORE_ID,
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
      and(eq(locations.id, input.id), eq(locations.storeId, DEMO_STORE_ID)),
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
  await db
    .delete(locations)
    .where(
      and(eq(locations.id, input.id), eq(locations.storeId, DEMO_STORE_ID)),
    );

  revalidatePath("/products");
  return { success: true };
}