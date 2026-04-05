"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { brands } from "@/db/schema";
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

export async function listBrandsAction() {
  return db
    .select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
    })
    .from(brands)
    .where(eq(brands.storeId, DEMO_STORE_ID))
    .orderBy(asc(brands.name));
}

export async function createBrandAction(input: { name: string }) {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Tên thương hiệu là bắt buộc");
  }

  const slug = slugify(name);

  const result = await db
    .insert(brands)
    .values({
      storeId: DEMO_STORE_ID,
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
    .where(and(eq(brands.id, input.id), eq(brands.storeId, DEMO_STORE_ID)))
    .returning({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
    });

  revalidatePath("/products");
  return result[0] ?? null;
}

export async function deleteBrandAction(input: { id: string }) {
  await db
    .delete(brands)
    .where(and(eq(brands.id, input.id), eq(brands.storeId, DEMO_STORE_ID)));

  revalidatePath("/products");
  return { success: true };
}