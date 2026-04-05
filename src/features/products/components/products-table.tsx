"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { ProductRow } from "../types";

type Props = {
  data: ProductRow[];
};

function formatCurrency(value: string) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStockStatus(product: ProductRow) {
  if (product.status === "inactive") return "inactive";
  if (product.currentStock <= 0) return "out";
  if (product.currentStock <= product.minStockAlert) return "low";
  if (product.currentStock > product.maxStockAlert) return "high";
  return "ok";
}

function getStockStatusBadge(status: ReturnType<typeof getStockStatus>) {
  switch (status) {
    case "out":
      return {
        label: "Hết hàng",
        className: "bg-out-of-stock text-out-of-stock-foreground",
      };
    case "low":
      return {
        label: "Sắp hết",
        className: "bg-warning text-warning-foreground",
      };
    case "high":
      return {
        label: "Tồn cao",
        className: "bg-info text-info-foreground",
      };
    case "inactive":
      return {
        label: "Ngừng bán",
        className: "bg-inactive text-inactive-foreground",
      };
    default:
      return {
        label: "Còn hàng",
        className: "bg-success text-success-foreground",
      };
  }
}

export function ProductsTable({ data }: Props) {
  const router = useRouter();

  return (
    <div className="table-shell">
      <div className="table-content">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b">
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Mã hàng
              </th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Tên hàng
              </th>
              <th className="h-11 px-4 text-right font-medium text-muted-foreground">
                Giá bán
              </th>
              <th className="h-11 px-4 text-right font-medium text-muted-foreground">
                Giá vốn
              </th>
              <th className="h-11 px-4 text-right font-medium text-muted-foreground">
                Tồn kho
              </th>
              <th className="h-11 px-4 text-right font-medium text-muted-foreground">
                Khách đặt
              </th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Thời gian tạo
              </th>
              <th className="h-11 px-4 text-left font-medium text-muted-foreground">
                Dự kiến hết hàng
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => {
              const stockStatus = getStockStatus(item);
              const stockStatusBadge = getStockStatusBadge(stockStatus);

              return (
                <tr
                  key={item.id}
                  className="cursor-pointer border-b hover:bg-muted/30"
                  onClick={() => router.push(`/products/${item.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/products/${item.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
                        {item.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.thumbnailUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            IMG
                          </span>
                        )}
                      </div>

                      <div className="font-medium">{item.sku}</div>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.categoryName ?? "-"}
                      {item.brandName ? ` • ${item.brandName}` : ""}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right align-top tabular">
                    {formatCurrency(item.salePrice)}
                  </td>

                  <td className="px-4 py-3 text-right align-top tabular">
                    {formatCurrency(item.costPrice)}
                  </td>

                  <td className="px-4 py-3 text-right align-top tabular">
                    <div>{item.currentStock}</div>
                    <div className="mt-1 flex justify-end">
                      <Badge className={stockStatusBadge.className}>
                        {stockStatusBadge.label}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right align-top tabular">0</td>

                  <td className="px-4 py-3 align-top">
                    {formatDate(item.createdAt)}
                  </td>

                  <td className="px-4 py-3 align-top text-muted-foreground">
                    ---
                  </td>
                </tr>
              );
            })}

            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
