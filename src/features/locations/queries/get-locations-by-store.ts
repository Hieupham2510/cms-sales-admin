import { db } from "@/db";
import { locations } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getLocationsByStore(storeId: string) {
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