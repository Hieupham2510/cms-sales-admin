import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { SalesOrderStatusActions } from "@/features/sales/components/sales-order-status-actions";
import { variantSummary } from "@/features/products/variant-utils";
import { getSalesOrderById } from "@/features/sales/queries/get-sales-order-by-id";
import { TABLE_PAGE_SIZE } from "@/lib/constants";
import {
  formatCurrency,
  formatDateTime,
  salesOrderStatusBadgeClass,
  salesOrderStatusLabel,
} from "@/features/sales/utils";

export default async function SalesOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const requestedPage = Number(query.page ?? "1");
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const storeId = await getActiveStoreIdOrThrow();
  const order = await getSalesOrderById({ id, storeId });

  if (!order) {
    notFound();
  }

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = order.items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / TABLE_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * TABLE_PAGE_SIZE;
  const pageItems = order.items.slice(start, start + TABLE_PAGE_SIZE);

  return (
    <div className="section-block space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{order.orderCode}</h1>
          <p className="page-description">
            Chi tiết hóa đơn bán hàng và trạng thái xử lý.
          </p>
        </div>

        <div className="toolbar-actions">
          <Button
            variant="outline"
            render={<Link href={`/sales/orders/${order.id}/print`} target="_blank" />}
            nativeButton={false}
          >
            In hóa đơn
          </Button>
          <Button variant="outline" render={<Link href="/sales/orders" />} nativeButton={false}>
            Quay lại
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">{order.customerName}</h2>
          <Badge className={salesOrderStatusBadgeClass(order.status)}>
            {salesOrderStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Mã KH: </span>
            {order.customerCode}
          </p>
          <p>
            <span className="text-muted-foreground">Thời gian bán: </span>
            {formatDateTime(order.soldAt)}
          </p>
          <p>
            <span className="text-muted-foreground">Điện thoại: </span>
            {order.customerPhone ?? "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Phương thức TT: </span>
            {order.paymentMethod}
          </p>
        </div>

        <div className="mt-4">
          <SalesOrderStatusActions orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="table-shell">
        <div className="table-content">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="h-11 px-4 text-left font-medium text-muted-foreground">Mã hàng</th>
                <th className="h-11 px-4 text-left font-medium text-muted-foreground">Tên hàng</th>
                <th className="h-11 px-4 text-right font-medium text-muted-foreground">Số lượng</th>
                <th className="h-11 px-4 text-right font-medium text-muted-foreground">Đơn giá</th>
                <th className="h-11 px-4 text-right font-medium text-muted-foreground">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{item.skuSnapshot}</td>
                  <td className="px-4 py-3">
                    <div>{item.nameSnapshot}</div>
                    {item.selectedVariants.length > 0 ? (
                      <div className="text-xs text-muted-foreground">
                        {variantSummary(item.selectedVariants)}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right tabular">{item.quantity}</td>
                  <td className="px-4 py-3 text-right tabular">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right tabular font-semibold">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-2 border-t px-4 py-3 text-sm text-muted-foreground md:flex-row">
          <p>
            Hiển thị {totalItems === 0 ? 0 : start + 1}-{Math.min(start + TABLE_PAGE_SIZE, totalItems)} / {totalItems}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              render={<Link href={`/sales/orders/${order.id}?page=${Math.max(1, safePage - 1)}`} />}
              nativeButton={false}
            >
              Trước
            </Button>
            <span className="min-w-16 text-center text-foreground">
              {safePage}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              render={<Link href={`/sales/orders/${order.id}?page=${Math.min(totalPages, safePage + 1)}`} />}
              nativeButton={false}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="ml-auto max-w-[360px] space-y-2 text-sm">
          <p className="flex justify-between">
            <span className="text-muted-foreground">Tổng tiền hàng ({totalQuantity})</span>
            <span className="tabular font-semibold">{formatCurrency(order.subtotalAmount)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground">Giảm giá</span>
            <span className="tabular">{formatCurrency(order.discountAmount)}</span>
          </p>
          <p className="flex justify-between font-semibold">
            <span>Tổng thanh toán</span>
            <span className="tabular">{formatCurrency(order.totalAmount)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-muted-foreground">Khách đã trả</span>
            <span className="tabular font-semibold">{formatCurrency(order.paidAmount)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
