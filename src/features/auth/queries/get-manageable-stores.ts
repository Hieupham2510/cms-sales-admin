import { db } from "@/db";
import { profileStoreAccess, stores } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import type { AuthContext } from "@/features/auth/types";

export async function getManageableStores(auth: AuthContext) {
  if (auth.role === "admin") {
    return db
      .select({
        id: stores.id,
        name: stores.name,
        slug: stores.slug,
      })
      .from(stores)
      .orderBy(asc(stores.name));
  }

  return db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
    })
    .from(profileStoreAccess)
    .innerJoin(stores, eq(profileStoreAccess.storeId, stores.id))
    .where(and(eq(profileStoreAccess.profileId, auth.profileId)))
    .orderBy(asc(stores.name));
}
