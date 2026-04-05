"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadProductImage(file: File) {
  const supabase = await createClient();

  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `products/${fileName}`;

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

  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
}