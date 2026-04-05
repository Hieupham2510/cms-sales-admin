import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/features/products/components/products-table";
import { getProducts } from "@/features/products/queries";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export default async function ProductsPage() {
  const products = await getProducts({
    storeId: DEMO_STORE_ID,
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
