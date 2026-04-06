import { notFound } from "next/navigation";
import { AutoPrint } from "@/features/sales/components/auto-print";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import { variantSummary } from "@/features/products/variant-utils";
import { getSalesOrderById } from "@/features/sales/queries/get-sales-order-by-id";
import { formatCurrency, formatDateTime } from "@/features/sales/utils";

export default async function SalesOrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeId = await getActiveStoreIdOrThrow();
  const order = await getSalesOrderById({ id, storeId });

  if (!order) {
    notFound();
  }

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mx-auto max-w-[960px] bg-white p-6 text-black print:max-w-none print:p-0">
      <AutoPrint />
      <style>{`
        @media print {
          aside,
          header {
            display: none !important;
          }

          main.page-container {
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">HÓA ĐƠN BÁN HÀNG</h1>
          <p className="text-sm">Số HD: {order.orderCode}</p>
          <p className="text-sm">Ngày: {formatDateTime(order.soldAt)}</p>
        </div>
      </div>

      <div className="mb-4 space-y-1 border-y border-black py-3 text-sm">
        <p>
          <span className="font-medium">Khách hàng:</span> {order.customerName}
        </p>
        <p>
          <span className="font-medium">Mã KH:</span> {order.customerCode}
        </p>
        <p>
          <span className="font-medium">Điện thoại:</span> {order.customerPhone ?? "-"}
        </p>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black">
            <th className="px-2 py-2 text-left">Mã hàng</th>
            <th className="px-2 py-2 text-left">Tên hàng</th>
            <th className="px-2 py-2 text-right">SL</th>
            <th className="px-2 py-2 text-right">Đơn giá</th>
            <th className="px-2 py-2 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-dashed border-black/60">
              <td className="px-2 py-2">{item.skuSnapshot}</td>
              <td className="px-2 py-2">
                <div>{item.nameSnapshot}</div>
                {item.selectedVariants.length > 0 ? (
                  <div className="text-xs text-black/70">
                    {variantSummary(item.selectedVariants)}
                  </div>
                ) : null}
              </td>
              <td className="px-2 py-2 text-right">{item.quantity}</td>
              <td className="px-2 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="px-2 py-2 text-right">{formatCurrency(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-6 max-w-[360px] space-y-1 text-sm">
        <p className="flex justify-between">
          <span>Tổng tiền hàng ({totalQuantity})</span>
          <span>{formatCurrency(order.subtotalAmount)}</span>
        </p>
        <p className="flex justify-between">
          <span>Giảm giá</span>
          <span>{formatCurrency(order.discountAmount)}</span>
        </p>
        <p className="flex justify-between font-bold">
          <span>Tổng thanh toán</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </p>
        <p className="flex justify-between">
          <span>Khách đã trả</span>
          <span>{formatCurrency(order.paidAmount)}</span>
        </p>
      </div>
    </div>
  );
}
