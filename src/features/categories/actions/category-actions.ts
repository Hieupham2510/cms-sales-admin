"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories } from "@/db/schema";
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

export async function listCategoriesAction() {
  const storeId = await getActiveStoreIdOrThrow();

  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .where(eq(categories.storeId, storeId))
    .orderBy(asc(categories.name));
}

export async function createCategoryAction(input: { name: string }) {
  const storeId = await getActiveStoreIdOrThrow();
  const name = input.name.trim();

  if (!name) {
    throw new Error("Tên nhóm hàng là bắt buộc");
  }

  const slug = slugify(name);

  const result = await db
    .insert(categories)
    .values({
      storeId,
      name,
      slug,
      description: null,
    })
    .returning({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    });

  revalidatePath("/products");
  return result[0];
}

export async function updateCategoryAction(input: {
  id: string;
  name: string;
}) {
  const storeId = await getActiveStoreIdOrThrow();
  const name = input.name.trim();

  if (!name) {
    throw new Error("Tên nhóm hàng là bắt buộc");
  }

  const slug = slugify(name);

  const result = await db
    .update(categories)
    .set({
      name,
      slug,
      updatedAt: new Date(),
    })
    .where(
      and(eq(categories.id, input.id), eq(categories.storeId, storeId)),
    )
    .returning({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    });

  revalidatePath("/products");
  return result[0] ?? null;
}

export async function deleteCategoryAction(input: { id: string }) {
  const storeId = await getActiveStoreIdOrThrow();
  await db
    .delete(categories)
    .where(
      and(eq(categories.id, input.id), eq(categories.storeId, storeId)),
    );

  revalidatePath("/products");
  return { success: true };
}
