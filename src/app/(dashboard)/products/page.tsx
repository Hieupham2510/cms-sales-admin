import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getBrandsByStore } from "@/features/brands/queries/get-brands-by-store";
import { getCategoriesByStore } from "@/features/categories/queries/get-categories-by-store";
import { ProductsTable } from "@/features/products/components/products-table";
import { ProductsFilters } from "@/features/products/components/products-filters";
import { requireAuthContext } from "@/features/auth/queries/get-auth-context";
import { getLocationsByStore } from "@/features/locations/queries/get-locations-by-store";
import { getProducts } from "@/features/products/queries";

type Props = {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function values(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function stockStates(value: string | string[] | undefined) {
  return values(value).filter((item): item is "out" | "low" | "ok" | "high" =>
    item === "out" || item === "low" || item === "ok" || item === "high",
  );
}

function toNumber(value: string | string[] | undefined) {
  const raw = firstValue(value).trim();
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function ProductsPage({ searchParams }: Props) {
  const auth = await requireAuthContext();
  if (!auth.activeStoreId) {
    throw new Error("Tài khoản chưa được gán cửa hàng");
  }

  const params = (await searchParams) ?? {};

  const [
    products,
    categories,
    brands,
    locations,
  ] = await Promise.all([
    getProducts({
      storeId: auth.activeStoreId,
      search: firstValue(params.search),
      categoryId: firstValue(params.categoryId),
      brandId: firstValue(params.brandId),
      locationId: firstValue(params.locationId),
      salePriceMin: toNumber(params.salePriceMin),
      salePriceMax: toNumber(params.salePriceMax),
      costPriceMin: toNumber(params.costPriceMin),
      costPriceMax: toNumber(params.costPriceMax),
      currentStockMin: toNumber(params.currentStockMin),
      currentStockMax: toNumber(params.currentStockMax),
      customerOrderQuantityMin: toNumber(params.customerOrderQuantityMin),
      customerOrderQuantityMax: toNumber(params.customerOrderQuantityMax),
      stockStates: stockStates(params.stockState),
    }),
    getCategoriesByStore(auth.activeStoreId),
    getBrandsByStore(auth.activeStoreId),
    getLocationsByStore(auth.activeStoreId),
  ]);

  const initialFilterValue = {
    search: firstValue(params.search),
    stockStates: stockStates(params.stockState),
    salePriceMin: firstValue(params.salePriceMin),
    salePriceMax: firstValue(params.salePriceMax),
    costPriceMin: firstValue(params.costPriceMin),
    costPriceMax: firstValue(params.costPriceMax),
    currentStockMin: firstValue(params.currentStockMin),
    currentStockMax: firstValue(params.currentStockMax),
    customerOrderQuantityMin: firstValue(params.customerOrderQuantityMin),
    customerOrderQuantityMax: firstValue(params.customerOrderQuantityMax),
    categoryId: firstValue(params.categoryId),
    brandId: firstValue(params.brandId),
    locationId: firstValue(params.locationId),
  };

  return (
    <div className="page-container space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hàng hóa</h1>
          <p className="page-description">
            Quản lý danh sách sản phẩm và tồn kho.
          </p>
        </div>

        <div className="toolbar-actions">
          <Button
            render={<Link href="/products/export" />}
            variant="outline"
            nativeButton={false}
          >
            Xuất Excel
          </Button>

          <Button render={<Link href="/products/new" />} nativeButton={false}>
            Thêm hàng hóa
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <ProductsFilters
          categories={categories}
          brands={brands}
          locations={locations}
          initialValue={initialFilterValue}
        />
        <ProductsTable data={products} role={auth.role} />
      </div>
    </div>
  );
}
