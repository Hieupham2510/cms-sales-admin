import { db } from "@/db";
import { brands } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getBrandsByStore(storeId: string) {
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