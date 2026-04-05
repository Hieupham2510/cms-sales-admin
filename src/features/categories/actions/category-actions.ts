"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

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
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .where(eq(categories.storeId, DEMO_STORE_ID))
    .orderBy(asc(categories.name));
}

export async function createCategoryAction(input: { name: string }) {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Tên nhóm hàng là bắt buộc");
  }

  const slug = slugify(name);

  const result = await db
    .insert(categories)
    .values({
      storeId: DEMO_STORE_ID,
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
      and(eq(categories.id, input.id), eq(categories.storeId, DEMO_STORE_ID)),
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
  await db
    .delete(categories)
    .where(
      and(eq(categories.id, input.id), eq(categories.storeId, DEMO_STORE_ID)),
    );

  revalidatePath("/products");
  return { success: true };
}