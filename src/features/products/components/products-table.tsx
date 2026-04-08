"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/shared/table-pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteProductAction } from "@/features/products/actions/delete-product-action";
import type { AppRole } from "@/features/auth/types";
import type { ProductRow } from "../types";
import { TABLE_PAGE_SIZE } from "@/lib/constants";

type Props = {
  data: ProductRow[];
  role: AppRole;
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

export function ProductsTable({ data, role }: Props) {
  const router = useRouter();
  const [deletingProduct, setDeletingProduct] = useState<ProductRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / TABLE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * TABLE_PAGE_SIZE;
    return data.slice(start, start + TABLE_PAGE_SIZE);
  }, [currentPage, data]);

  const handleDeleteProduct = () => {
    if (!deletingProduct) return;

    startTransition(async () => {
      try {
        await deleteProductAction(deletingProduct.id);
        toast.success("Xóa sản phẩm thành công");
        setDeletingProduct(null);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể xóa sản phẩm");
      }
    });
  };

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
              <th className="h-11 px-4 text-right font-medium text-muted-foreground">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody>
            {pageData.map((item) => {
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

                  <td className="px-4 py-3 text-right align-top tabular">
                    {item.customerOrderQuantity}
                  </td>

                  <td className="px-4 py-3 align-top">
                    {formatDate(item.createdAt)}
                  </td>

                  <td
                    className="px-4 py-3 align-top"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    {role === "admin" ? (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingProduct(item)}
                          aria-label={`Xóa sản phẩm ${item.name}`}
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}

            {pageData.length === 0 ? (
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
      <TablePagination
        page={currentPage}
        totalItems={data.length}
        pageSize={TABLE_PAGE_SIZE}
        onPageChange={setPage}
      />

      <Dialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {`Bạn có chắc chắn muốn xóa sản phẩm "${deletingProduct?.name ?? ""}"?`}
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingProduct(null)}
              disabled={isPending}
            >
              Không
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={isPending}
            >
              {isPending ? "Đang xóa..." : "Xóa sản phẩm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
