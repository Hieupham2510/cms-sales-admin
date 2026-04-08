import { createProductAction } from "@/features/products/actions/create-product-action";
import { ProductForm } from "@/features/products/components/product-form";
import { requireAuthContext } from "@/features/auth/queries/get-auth-context";
import { getCategoriesByStore } from "@/features/categories/queries/get-categories-by-store";
import { getBrandsByStore } from "@/features/brands/queries/get-brands-by-store";
import { getLocationsByStore } from "@/features/locations/queries/get-locations-by-store";

export default async function NewProductPage() {
  const auth = await requireAuthContext();
  if (!auth.activeStoreId) {
    throw new Error("Tài khoản chưa được gán cửa hàng");
  }
  const [categories, brands, locations] = await Promise.all([
    getCategoriesByStore(auth.activeStoreId),
    getBrandsByStore(auth.activeStoreId),
    getLocationsByStore(auth.activeStoreId),
  ]);

  return (
    <div className="page-container">
      <ProductForm
        mode="create"
        categories={categories}
        brands={brands}
        locations={locations}
        role={auth.role}
        submitAction={createProductAction}
      />
    </div>
  );
}
