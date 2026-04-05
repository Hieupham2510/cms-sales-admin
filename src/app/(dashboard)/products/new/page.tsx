import { createProductAction } from "@/features/products/actions/create-product-action";
import { ProductForm } from "@/features/products/components/product-form";
import { getCategoriesByStore } from "@/features/categories/queries/get-categories-by-store";
import { getBrandsByStore } from "@/features/brands/queries/get-brands-by-store";
import { getLocationsByStore } from "@/features/locations/queries/get-locations-by-store";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export default async function NewProductPage() {
  const [categories, brands, locations] = await Promise.all([
    getCategoriesByStore(DEMO_STORE_ID),
    getBrandsByStore(DEMO_STORE_ID),
    getLocationsByStore(DEMO_STORE_ID),
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