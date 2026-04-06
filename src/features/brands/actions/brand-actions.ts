"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { and, asc, eq } from "drizzle-orm";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listBrandsAction() {
  const storeId = await getActiveStoreIdOrThrow();

  return db
    .select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
    })
    .from(brands)
    .where(eq(brands.storeId, storeId))
    .orderBy(asc(brands.name));
}

export async function createBrandAction(input: { name: string }) {
  const storeId = await getActiveStoreIdOrThrow();
  const name = input.name.trim();

  if (!name) {
    throw new Error("Tên thương hiệu là bắt buộc");
  }

  const slug = slugify(name);

  const result = await db
    .insert(brands)
    .values({
      storeId,
      name,
      slug,
      description: null,
    })
    .returning({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
    });

  revalidatePath("/products");
  return result[0];
}

export async function updateBrandAction(input: {
  id: string;
  name: string;
}) {
  const storeId = await getActiveStoreIdOrThrow();
  const name = input.name.trim();

  if (!name) {
    throw new Error("Tên thương hiệu là bắt buộc");
  }

  const slug = slugify(name);

  const result = await db
    .update(brands)
    .set({
      name,
      slug,
      updatedAt: new Date(),
    })
    .where(and(eq(brands.id, input.id), eq(brands.storeId, storeId)))
    .returning({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
    });

  revalidatePath("/products");
  return result[0] ?? null;
}

export async function deleteBrandAction(input: { id: string }) {
  const storeId = await getActiveStoreIdOrThrow();
  await db
    .delete(brands)
    .where(and(eq(brands.id, input.id), eq(brands.storeId, storeId)));

  revalidatePath("/products");
  return { success: true };
}
