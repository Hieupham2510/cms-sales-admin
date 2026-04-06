import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SalesPos } from "@/features/sales/components/sales-pos";
import { getSalesCustomers } from "@/features/sales/queries/get-sales-customers";
import { getSalesProducts } from "@/features/sales/queries/get-sales-products";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export default async function SalesPage() {
  const [products, customers] = await Promise.all([
    getSalesProducts({ storeId: DEMO_STORE_ID }),
    getSalesCustomers({ storeId: DEMO_STORE_ID }),
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
