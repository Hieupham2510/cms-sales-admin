import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { SalesOrdersTable } from "@/features/sales/components/sales-orders-table";
import { getSalesOrders } from "@/features/sales/queries/get-sales-orders";

const statusFilters = [
  { value: "all", label: "Tất cả" },
  { value: "processing", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn thành" },
  { value: "failed_delivery", label: "Không giao được" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

export default async function SalesOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const storeId = await getActiveStoreIdOrThrow();
  const status =
    params.status &&
    ["processing", "completed", "failed_delivery", "cancelled", "all"].includes(
      params.status,
    )
      ? (params.status as
          | "processing"
          | "completed"
          | "failed_delivery"
          | "cancelled"
          | "all")
      : "all";

  const orders = await getSalesOrders({
    storeId,
    status,
  });

  return (
    <div className="section-block space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Đơn bán</h1>
          <p className="page-description">
            Theo dõi hóa đơn và xử lý trạng thái giao hàng.
          </p>
        </div>

        <div className="toolbar-actions">
          <Button render={<Link href="/sales" />} nativeButton={false}>
            Tạo đơn mới
          </Button>
        </div>
      </div>

      <div className="toolbar-actions">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={status === filter.value ? "default" : "outline"}
            render={
              <Link
                href={
                  filter.value === "all"
                    ? "/sales/orders"
                    : `/sales/orders?status=${filter.value}`
                }
              />
            }
            nativeButton={false}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <SalesOrdersTable data={orders} />
    </div>
  );
}
