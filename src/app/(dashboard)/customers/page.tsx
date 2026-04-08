import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomersTable } from "@/features/customers/components/customers-table";
import { requireAuthContext } from "@/features/auth/queries/get-auth-context";
import { getCustomers } from "@/features/customers/queries/get-customers";

type Props = {
  searchParams?: Promise<{
    search?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: Props) {
  const auth = await requireAuthContext();
  if (!auth.activeStoreId) {
    throw new Error("Tài khoản chưa được gán cửa hàng");
  }

  const params = (await searchParams) ?? {};
  const customers = await getCustomers({ storeId: auth.activeStoreId, search: params.search });

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

      <CustomersTable data={customers} role={auth.role} />
    </div>
  );
}
