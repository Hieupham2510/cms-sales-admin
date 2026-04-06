import { db } from "@/db";
import { profileStoreAccess, profiles, stores } from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import type { AuthContext } from "@/features/auth/types";

export async function getUserAccounts(auth: AuthContext) {
  if (auth.role === "staff") {
    return [];
  }

  const baseRows =
    auth.role === "admin"
      ? await db
          .select({
            id: profiles.id,
            username: profiles.username,
            fullName: profiles.fullName,
            email: profiles.email,
            role: profiles.role,
            updatedAt: profiles.updatedAt,
          })
          .from(profiles)
          .orderBy(asc(profiles.username))
      : await db
          .select({
            id: profiles.id,
            username: profiles.username,
            fullName: profiles.fullName,
            email: profiles.email,
            role: profiles.role,
            updatedAt: profiles.updatedAt,
          })
          .from(profiles)
          .where(inArray(profiles.role, ["manager", "staff"]))
          .orderBy(asc(profiles.username));

  if (baseRows.length === 0) return [];

  const accessRows = await db
    .select({
      profileId: profileStoreAccess.profileId,
      storeId: stores.id,
      storeName: stores.name,
      isDefault: profileStoreAccess.isDefault,
    })
    .from(profileStoreAccess)
    .innerJoin(stores, eq(profileStoreAccess.storeId, stores.id))
    .where(inArray(profileStoreAccess.profileId, baseRows.map((item) => item.id)));

  const accessMap = new Map<
    string,
    { storeId: string; storeName: string; isDefault: boolean }[]
  >();

  for (const row of accessRows) {
    const current = accessMap.get(row.profileId) ?? [];
    current.push({
      storeId: row.storeId,
      storeName: row.storeName,
      isDefault: row.isDefault,
    });
    accessMap.set(row.profileId, current);
  }

  const filteredRows =
    auth.role === "admin"
      ? baseRows
      : baseRows.filter((item) => {
          const accesses = accessMap.get(item.id) ?? [];
          return accesses.some((access) =>
            auth.allowedStores.some((store) => store.id === access.storeId),
          );
        });

  return filteredRows.map((item) => ({
    ...item,
    stores: (accessMap.get(item.id) ?? []).sort((a, b) => {
      if (a.isDefault === b.isDefault) return a.storeName.localeCompare(b.storeName);
      return a.isDefault ? -1 : 1;
    }),
  }));
}
