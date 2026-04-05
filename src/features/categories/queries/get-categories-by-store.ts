import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getCategoriesByStore(storeId: string) {
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