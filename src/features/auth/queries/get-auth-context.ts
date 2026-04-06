import { cookies } from "next/headers";
import { db } from "@/db";
import { profileStoreAccess, profiles, stores } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, AuthContext } from "@/features/auth/types";

const ACTIVE_STORE_COOKIE = "active_store_id";

function normalizeRole(value: string | null | undefined): AppRole {
  if (value === "admin" || value === "manager" || value === "staff") {
    return value;
  }
  return "staff";
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile] = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      fullName: profiles.fullName,
      email: profiles.email,
      role: profiles.role,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile) return null;

  const role = normalizeRole(profile.role);
  const cookieStore = await cookies();
  const requestedStoreId = cookieStore.get(ACTIVE_STORE_COOKIE)?.value ?? null;

  const storeRows =
    role === "admin"
      ? await db
          .select({
            id: stores.id,
            name: stores.name,
            slug: stores.slug,
            isDefault: profileStoreAccess.isDefault,
          })
          .from(stores)
          .leftJoin(
            profileStoreAccess,
            and(
              eq(profileStoreAccess.storeId, stores.id),
              eq(profileStoreAccess.profileId, profile.id),
            ),
          )
          .orderBy(asc(stores.name))
      : await db
          .select({
            id: stores.id,
            name: stores.name,
            slug: stores.slug,
            isDefault: profileStoreAccess.isDefault,
          })
          .from(profileStoreAccess)
          .innerJoin(stores, eq(profileStoreAccess.storeId, stores.id))
          .where(eq(profileStoreAccess.profileId, profile.id))
          .orderBy(asc(stores.name));

  const allowedStores = storeRows.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
  }));

  let activeStoreId: string | null = null;

  if (requestedStoreId && allowedStores.some((item) => item.id === requestedStoreId)) {
    activeStoreId = requestedStoreId;
  } else {
    const defaultStore = storeRows.find((item) => item.isDefault);
    if (defaultStore) {
      activeStoreId = defaultStore.id;
    } else {
      activeStoreId = allowedStores[0]?.id ?? null;
    }
  }

  return {
    userId: user.id,
    profileId: profile.id,
    username: profile.username,
    fullName: profile.fullName,
    email: profile.email,
    role,
    activeStoreId,
    allowedStores,
  };
}

export async function requireAuthContext() {
  const auth = await getAuthContext();
  if (!auth) {
    throw new Error("Bạn chưa đăng nhập");
  }
  return auth;
}

export async function getActiveStoreIdOrThrow() {
  const auth = await requireAuthContext();
  if (!auth.activeStoreId) {
    throw new Error("Tài khoản chưa được gán cửa hàng");
  }
  return auth.activeStoreId;
}

export { ACTIVE_STORE_COOKIE };
