import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { SalesPos } from "@/features/sales/components/sales-pos";
import { getSalesCustomers } from "@/features/sales/queries/get-sales-customers";
import { getSalesProducts } from "@/features/sales/queries/get-sales-products";

export default async function SalesPage() {
  const storeId = await getActiveStoreIdOrThrow();
  const [products, customers] = await Promise.all([
    getSalesProducts({ storeId }),
    getSalesCustomers({ storeId }),
  ]);

  return (
    <div className="section-block space-y-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bán hàng</h1>
          <p className="page-description">
            Tạo hóa đơn, kiểm tra tồn kho và thanh toán nhanh.
          </p>
        </div>

        <div className="toolbar-actions">
          <Button
            variant="outline"
            render={<Link href="/sales/orders" />}
            nativeButton={false}
          >
            Đơn bán
          </Button>
        </div>
      </div>

      <SalesPos initialProducts={products} customers={customers} />
    </div>
  );
}
