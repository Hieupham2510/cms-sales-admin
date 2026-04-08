"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { profileStoreAccess, stores } from "@/db/schema";
import { requireAuthContext } from "@/features/auth/queries/get-auth-context";
import {
  createStoreSchema,
  type CreateStoreInput,
} from "@/features/stores/schemas/create-store-schema";
import { createClient } from "@/lib/supabase/server";

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

async function uploadStoreLogo(file: File) {
  const supabase = await createClient();
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `store-logos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function createStoreAction(input: CreateStoreInput) {
  const auth = await requireAuthContext();
  if (auth.role !== "admin") {
    throw new Error("Chỉ quản trị viên mới được tạo cửa hàng");
  }

  const parsed = createStoreSchema.parse(input);
  const name = parsed.name.trim();
  const slug = slugify(parsed.slug?.trim() || name);

  if (!slug) {
    throw new Error("Không thể tạo slug cửa hàng");
  }

  const [existingStore] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.slug, slug))
    .limit(1);

  if (existingStore) {
    throw new Error("Slug cửa hàng đã tồn tại");
  }

  let logoUrl: string | null = null;
  if (parsed.logoFile && parsed.logoFile.size > 0) {
    logoUrl = await uploadStoreLogo(parsed.logoFile);
  }

  const [createdStore] = await db
    .insert(stores)
    .values({
      name,
      slug,
      logoUrl,
      updatedAt: new Date(),
    })
    .returning({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      logoUrl: stores.logoUrl,
    });

  const [existingAccess] = await db
    .select({ id: profileStoreAccess.id })
    .from(profileStoreAccess)
    .where(
      and(
        eq(profileStoreAccess.profileId, auth.profileId),
        eq(profileStoreAccess.storeId, createdStore.id),
      ),
    )
    .limit(1);

  if (!existingAccess) {
    const [defaultAccess] = await db
      .select({ id: profileStoreAccess.id })
      .from(profileStoreAccess)
      .where(
        and(eq(profileStoreAccess.profileId, auth.profileId), eq(profileStoreAccess.isDefault, true)),
      )
      .limit(1);

    await db.insert(profileStoreAccess).values({
      profileId: auth.profileId,
      storeId: createdStore.id,
      isDefault: !defaultAccess,
      updatedAt: new Date(),
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");

  return {
    success: true,
    store: createdStore,
  };
}
