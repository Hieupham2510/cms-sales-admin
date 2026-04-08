"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/shared/table-pagination";
import { TABLE_PAGE_SIZE } from "@/lib/constants";
import {
  formatCurrency,
  formatDateTime,
  salesOrderStatusBadgeClass,
  salesOrderStatusLabel,
} from "@/features/sales/utils";

type Row = {
  id: string;
  orderCode: string;
  status: string;
  subtotalAmount: string;
  discountAmount: string;
  totalAmount: string;
  paidAmount: string;
  soldAt: Date;
  customerCode: string;
  customerName: string;
  itemQuantityTotal: number;
};

type Props = {
  data: Row[];
};

export function SalesOrdersTable({ data }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / TABLE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * TABLE_PAGE_SIZE;
    return data.slice(start, start + TABLE_PAGE_SIZE);
  }, [currentPage, data]);

  return (
    <div className="table-shell">
      <div className="table-content">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b">
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">Mã hóa đơn</th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">Thời gian</th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">Khách hàng</th>
              <th className="h-11 px-4 text-right font-medium text-muted-foreground">SL</th>
              <th className="h-11 px-4 text-right font-medium text-muted-foreground">Tổng tiền</th>
              <th className="h-11 px-4 text-right font-medium text-muted-foreground">Đã trả</th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-b hover:bg-muted/20"
                onClick={() => router.push(`/sales/orders/${item.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/sales/orders/${item.id}`);
                  }
                }}
                tabIndex={0}
                role="link"
              >
                <td className="px-4 py-3 font-medium">{item.orderCode}</td>
                <td className="px-4 py-3">{formatDateTime(item.soldAt)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{item.customerName}</div>
                  <div className="text-xs text-muted-foreground">{item.customerCode}</div>
                </td>
                <td className="px-4 py-3 text-right tabular">{item.itemQuantityTotal}</td>
                <td className="px-4 py-3 text-right tabular font-semibold">
                  {formatCurrency(item.totalAmount)}
                </td>
                <td className="px-4 py-3 text-right tabular">{formatCurrency(item.paidAmount)}</td>
                <td className="px-4 py-3">
                  <Badge className={salesOrderStatusBadgeClass(item.status)}>
                    {salesOrderStatusLabel(item.status)}
                  </Badge>
                </td>
              </tr>
            ))}

            {pageData.length === 0 ? (
              <tr>
                <td colSpan={7} className="h-24 text-center text-muted-foreground">
                  Chưa có đơn bán nào.
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
    </div>
  );
}
