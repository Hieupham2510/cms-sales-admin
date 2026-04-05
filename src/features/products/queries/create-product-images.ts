import { db } from "@/db";
import { productImages } from "@/db/schema";

type CreateProductImageInput = {
  productId: string;
  imageUrl: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

export async function createProductImages(
  items: CreateProductImageInput[],
) {
  if (items.length === 0) return [];

  return db
    .insert(productImages)
    .values(
      items.map((item) => ({
        productId: item.productId,
        imageUrl: item.imageUrl,
        sortOrder: item.sortOrder ?? 0,
        isPrimary: item.isPrimary ?? false,
      })),
    )
    .returning();
}