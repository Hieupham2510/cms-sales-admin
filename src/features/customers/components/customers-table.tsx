"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/shared/table-pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { variantSummary, type SelectedVariant } from "@/features/products/variant-utils";
import { deleteCustomerAction } from "@/features/customers/actions/delete-customer-action";
import type { AppRole } from "@/features/auth/types";
import { TABLE_PAGE_SIZE } from "@/lib/constants";
import {
  formatCurrency,
  formatDateTime,
  salesOrderStatusBadgeClass,
  salesOrderStatusLabel,
  salesPaymentMethodLabel,
} from "@/features/sales/utils";

type CustomerRow = {
  id: string;
  code: string;
  name: string;
  groupName: string | null;
  phone: string | null;
  email: string | null;
  gender: string | null;
  updatedAt: Date;
};

type Props = {
  data: CustomerRow[];
  role: AppRole;
};

type PurchaseHistoryItem = {
  id: string;
  productId: string;
  skuSnapshot: string;
  nameSnapshot: string;
  selectedVariants: SelectedVariant[];
  unitPrice: string;
  quantity: number;
  lineTotal: string;
};

type PurchaseHistoryOrder = {
  id: string;
  orderCode: string;
  status: string;
  subtotalAmount: string;
  discountAmount: string;
  totalAmount: string;
  paidAmount: string;
  paymentMethod: string;
  note: string | null;
  soldAt: string;
  itemQuantityTotal: number;
  items: PurchaseHistoryItem[];
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CustomersTable({ data, role }: Props) {
  const router = useRouter();
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerRow | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<CustomerRow | null>(null);
  const [historyOrders, setHistoryOrders] = useState<PurchaseHistoryOrder[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / TABLE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * TABLE_PAGE_SIZE;
    return data.slice(start, start + TABLE_PAGE_SIZE);
  }, [currentPage, data]);

  const handleDeleteCustomer = () => {
    if (!deletingCustomer) return;

    startTransition(async () => {
      try {
        await deleteCustomerAction(deletingCustomer.id);
        toast.success("Xóa khách hàng thành công");
        setDeletingCustomer(null);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa khách hàng");
      }
    });
  };

  const handleOpenPurchaseHistory = async (customer: CustomerRow) => {
    setHistoryCustomer(customer);
    setHistoryLoading(true);
    setHistoryOrders([]);

    try {
      const response = await fetch(`/api/customers/${customer.id}/purchase-history`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as
        | { orders: PurchaseHistoryOrder[] }
        | { error: string };

      if (!response.ok || !("orders" in payload)) {
        throw new Error("error" in payload ? payload.error : "Không thể lấy lịch sử mua hàng");
      }

      setHistoryOrders(payload.orders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lấy lịch sử mua hàng");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="table-shell">
      <div className="table-content">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b">
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Mã khách hàng
              </th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Tên khách hàng
              </th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Nhóm
              </th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Điện thoại
              </th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Email
              </th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Giới tính
              </th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Cập nhật
              </th>
              <th className="h-11 px-4 text-right font-medium text-muted-foreground">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-b hover:bg-muted/20"
                onClick={() => router.push(`/customers/${item.id}`)}
              >
                <td className="px-4 py-3 font-medium">{item.code}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.groupName ?? "-"}</td>
                <td className="px-4 py-3">{item.phone ?? "-"}</td>
                <td className="px-4 py-3">{item.email ?? "-"}</td>
                <td className="px-4 py-3">
                  {item.gender === "male"
                    ? "Nam"
                    : item.gender === "female"
                      ? "Nữ"
                      : "-"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(item.updatedAt)}
                </td>
                <td
                  className="px-4 py-3 text-right"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => void handleOpenPurchaseHistory(item)}
                      aria-label={`Xem lịch sử mua hàng của ${item.name}`}
                      title="Lịch sử mua hàng"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    {role === "admin" ? (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDeletingCustomer(item)}
                        aria-label={`Xóa khách hàng ${item.name}`}
                        title="Xóa khách hàng"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}

            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có khách hàng.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={currentPage}
        totalItems={data.length}
        pageSize={TABLE_PAGE_SIZE}
        onPageChange={setPage}
      />

      <Dialog
        open={Boolean(deletingCustomer)}
        onOpenChange={(open) => !open && setDeletingCustomer(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa khách hàng</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {`Bạn có chắc chắn muốn xóa khách hàng "${deletingCustomer?.name ?? ""}"?`}
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingCustomer(null)}
              disabled={isPending}
            >
              Không
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCustomer}
              disabled={isPending}
            >
              {isPending ? "Đang xóa..." : "Xóa khách hàng"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(historyCustomer)}
        onOpenChange={(open) => {
          if (!open) {
            setHistoryCustomer(null);
            setHistoryOrders([]);
            setHistoryLoading(false);
          }
        }}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {`Lịch sử mua hàng - ${historyCustomer?.name ?? ""}`}
            </DialogTitle>
          </DialogHeader>

          {historyLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải lịch sử mua hàng...</p>
          ) : null}

          {!historyLoading && historyOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Khách hàng chưa có đơn mua ở trạng thái Hoàn thành.
            </div>
          ) : null}

          {!historyLoading && historyOrders.length > 0 ? (
            <div className="space-y-4">
              {historyOrders.map((order) => (
                <div key={order.id} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{order.orderCode}</p>
                        <Badge className={salesOrderStatusBadgeClass(order.status)}>
                          {salesOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(order.soldAt)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      render={<Link href={`/sales/orders/${order.id}`} />}
                      nativeButton={false}
                    >
                      Xem đơn
                    </Button>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <p>
                      <span className="text-muted-foreground">Tổng SL: </span>
                      <span className="tabular">{order.itemQuantityTotal}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phương thức TT: </span>
                      {salesPaymentMethodLabel(order.paymentMethod)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Tổng tiền hàng: </span>
                      <span className="tabular font-semibold">
                        {formatCurrency(order.subtotalAmount)}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Giảm giá: </span>
                      <span className="tabular">{formatCurrency(order.discountAmount)}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Tổng thanh toán: </span>
                      <span className="tabular font-semibold">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Khách đã trả: </span>
                      <span className="tabular font-semibold">
                        {formatCurrency(order.paidAmount)}
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr className="border-b">
                          <th className="h-10 px-3 text-left font-medium text-muted-foreground">
                            Mã hàng
                          </th>
                          <th className="h-10 px-3 text-left font-medium text-muted-foreground">
                            Tên hàng
                          </th>
                          <th className="h-10 px-3 text-right font-medium text-muted-foreground">
                            SL
                          </th>
                          <th className="h-10 px-3 text-right font-medium text-muted-foreground">
                            Đơn giá
                          </th>
                          <th className="h-10 px-3 text-right font-medium text-muted-foreground">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b last:border-b-0">
                            <td className="px-3 py-2 font-medium">{item.skuSnapshot}</td>
                            <td className="px-3 py-2">
                              <div>{item.nameSnapshot}</div>
                              {item.selectedVariants.length > 0 ? (
                                <div className="text-xs text-muted-foreground">
                                  {variantSummary(item.selectedVariants)}
                                </div>
                              ) : null}
                            </td>
                            <td className="px-3 py-2 text-right tabular">{item.quantity}</td>
                            <td className="px-3 py-2 text-right tabular">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-right tabular font-semibold">
                              {formatCurrency(item.lineTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {order.note ? (
                    <p className="mt-3 text-sm">
                      <span className="text-muted-foreground">Ghi chú đơn: </span>
                      {order.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
