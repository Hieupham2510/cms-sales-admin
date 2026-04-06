import { createProductAction } from "@/features/products/actions/create-product-action";
import { ProductForm } from "@/features/products/components/product-form";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { getCategoriesByStore } from "@/features/categories/queries/get-categories-by-store";
import { getBrandsByStore } from "@/features/brands/queries/get-brands-by-store";
import { getLocationsByStore } from "@/features/locations/queries/get-locations-by-store";

export default async function NewProductPage() {
  const storeId = await getActiveStoreIdOrThrow();
  const [categories, brands, locations] = await Promise.all([
    getCategoriesByStore(storeId),
    getBrandsByStore(storeId),
    getLocationsByStore(storeId),
  ]);

  return (
    <div className="page-container">
      <ProductForm
        mode="create"
        categories={categories}
        brands={brands}
        locations={locations}
        submitAction={createProductAction}
      />
    </div>
  );
}
