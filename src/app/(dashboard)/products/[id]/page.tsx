import { notFound } from "next/navigation";
import { ProductForm } from "@/features/products/components/product-form";
import { getCategoriesByStore } from "@/features/categories/queries/get-categories-by-store";
import { getBrandsByStore } from "@/features/brands/queries/get-brands-by-store";
import { getLocationsByStore } from "@/features/locations/queries/get-locations-by-store";
import { getProductById } from "@/features/products/queries/get-product-by-id";
import { updateProductAction } from "@/features/products/actions/update-product-action";
import type { ProductFormValues } from "@/features/products/schemas/product-form-schema";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [categories, brands, locations, product] = await Promise.all([
    getCategoriesByStore(DEMO_STORE_ID),
    getBrandsByStore(DEMO_STORE_ID),
    getLocationsByStore(DEMO_STORE_ID),
    getProductById({ id, storeId: DEMO_STORE_ID }),
  ]);

  if (!product) {
    notFound();
  }

  async function submitAction(values: ProductFormValues) {
    "use server";
    return updateProductAction(id, values);
  }

  return (
    <div className="page-container">
      <ProductForm
        mode="edit"
        defaultValues={{
          sku: product.sku,
          barcode: product.barcode ?? "",
          name: product.name,
          categoryId: product.categoryId ?? "",
          brandId: product.brandId ?? "",
          locationId: product.locationId ?? "",
          costPrice: product.costPrice,
          salePrice: product.salePrice,
          variants: product.variants ?? [],
          currentStock: product.currentStock,
          minStockAlert: product.minStockAlert,
          maxStockAlert: product.maxStockAlert,
          weightValue: product.weightValue ?? "0",
          weightUnit: product.weightUnit,
          description: product.description ?? "",
          orderNote: product.orderNote ?? "",
          status: product.status,
          images: product.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            isPrimary: image.isPrimary,
            sortOrder: image.sortOrder,
          })),
        }}
        categories={categories}
        brands={brands}
        locations={locations}
        submitAction={submitAction}
      />
    </div>
  );
}
