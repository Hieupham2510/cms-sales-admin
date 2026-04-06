import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomersTable } from "@/features/customers/components/customers-table";
import { getCustomers } from "@/features/customers/queries/get-customers";

const DEMO_STORE_ID = "03c8870e-a39e-4403-99f9-c14807a2cc7f";

export default async function CustomersPage() {
  const customers = await getCustomers({ storeId: DEMO_STORE_ID });

  return (
    <div className="section-block space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Khách hàng</h1>
          <p className="page-description">
            Quản lý thông tin khách hàng và địa chỉ giao dịch.
          </p>
        </div>

        <div className="toolbar-actions">
          <Button render={<Link href="/customers/new" />} nativeButton={false}>
            Thêm khách hàng
          </Button>
        </div>
      </div>

      <CustomersTable data={customers} />
    </div>
  );
}
