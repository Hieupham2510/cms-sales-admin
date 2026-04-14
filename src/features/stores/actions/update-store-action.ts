"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { requireAuthContext } from "@/features/auth/queries/get-auth-context";
import { updateStoreSchema, type UpdateStoreInput } from "@/features/stores/schemas/update-store-schema";
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

export async function updateStoreAction(input: UpdateStoreInput) {
  const auth = await requireAuthContext();
  if (auth.role !== "admin") {
    throw new Error("Chỉ quản trị viên mới được sửa cửa hàng");
  }

  const parsed = updateStoreSchema.parse(input);
  const name = parsed.name.trim();
  const slug = slugify(parsed.slug?.trim() || name);

  if (!slug) {
    throw new Error("Không thể tạo slug cửa hàng");
  }

  const [store] = await db
    .select({
      id: stores.id,
      logoUrl: stores.logoUrl,
    })
    .from(stores)
    .where(eq(stores.id, parsed.id))
    .limit(1);

  if (!store) {
    throw new Error("Không tìm thấy cửa hàng");
  }

  const [duplicateSlug] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(and(eq(stores.slug, slug), ne(stores.id, parsed.id)))
    .limit(1);

  if (duplicateSlug) {
    throw new Error("Slug cửa hàng đã tồn tại");
  }

  let logoUrl = store.logoUrl;
  if (parsed.logoFile && parsed.logoFile.size > 0) {
    logoUrl = await uploadStoreLogo(parsed.logoFile);
  }

  const [updated] = await db
    .update(stores)
    .set({
      name,
      slug,
      logoUrl,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, parsed.id))
    .returning({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      logoUrl: stores.logoUrl,
    });

  revalidatePath("/", "layout");
  revalidatePath("/settings");

  return updated;
}

