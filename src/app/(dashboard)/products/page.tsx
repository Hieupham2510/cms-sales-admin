import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/features/products/components/products-table";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { getProducts } from "@/features/products/queries";

export default async function ProductsPage() {
  const storeId = await getActiveStoreIdOrThrow();
  const products = await getProducts({
    storeId,
  });

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
            Export Excel
          </Button>

          <Button render={<Link href="/products/new" />} nativeButton={false}>
            Thêm hàng hóa
          </Button>
        </div>
      </div>

      <ProductsTable data={products} />
    </div>
  );
}
