import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { getActiveStoreIdOrThrow } from "@/features/auth/queries/get-auth-context";
import CancelInventoryCheckButton from "@/features/inventory-checks/components/cancel-inventory-check-button";
import { getInventoryCheckById } from "@/features/inventory-checks/queries/get-inventory-check-by-id";
import { getInventoryChecksByStore } from "@/features/inventory-checks/queries/get-inventory-checks-by-store";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default async function InventoryAdjustmentsPage() {
  const storeId = await getActiveStoreIdOrThrow();
  const checks = await getInventoryChecksByStore(storeId);
  const detailedChecks = await Promise.all(
    checks.map((check) =>
      getInventoryCheckById({ id: check.id, storeId }),
    ),
  );
  const detailedCheckMap = new Map(
    detailedChecks.filter(Boolean).map((item) => [item?.id ?? "", item]),
  );

  return (
    <div className="section-block space-y-6">
      <PageHeader
        title="Phiếu kiểm kho"
        description="Theo dõi các phiếu kiểm kho tự động khi tồn kho thay đổi."
      />

      <div className="rounded-xl border bg-card">
        <div className="grid grid-cols-[30px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1.8fr_1fr_auto] gap-3 border-b bg-muted/40 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div />
          <div>Mã kiểm kho</div>
          <div>Thời gian</div>
          <div>Ngày cân bằng</div>
          <div className="text-right">SL thực tế</div>
          <div className="text-right">Tổng thực tế</div>
          <div className="text-right">Tổng chênh lệch</div>
          <div className="text-right">SL lệch tăng</div>
          <div className="text-right">SL lệch giảm</div>
          <div>Ghi chú</div>
          <div className="text-right">Thao tác</div>
        </div>

        {checks.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            Chưa có phiếu kiểm kho.
          </div>
        ) : (
          checks.map((item, index) => {
            const detail = detailedCheckMap.get(item.id);
            const detailTotalDiffValue = detail
              ? detail.items.reduce(
                  (sum, detailItem) => sum + Number(detailItem.diffValue),
                  0,
                )
              : 0;

            return (
              <details
                key={item.id}
                className="group border-b last:border-b-0 [&[open]_.arrow]:rotate-180"
                open={index === 0}
              >
                <summary className="grid list-none cursor-pointer grid-cols-[30px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1.8fr_1fr_auto] items-center gap-3 px-4 py-3 text-sm [&::-webkit-details-marker]:hidden hover:bg-muted/20">
                  <ChevronDown className="arrow h-4 w-4 text-muted-foreground transition-transform" />
                  <div className="font-medium">{item.code}</div>
                  <div>{formatDate(item.createdAt)}</div>
                  <div>{formatDate(item.balancedAt)}</div>
                  <div className="text-right tabular-nums font-semibold text-primary">{item.actualQuantityTotal}</div>
                  <div className="text-right tabular-nums font-semibold text-primary">{formatCurrency(item.actualValueTotal)}</div>
                  <div className="text-right tabular-nums font-semibold text-primary">{formatCurrency(item.totalDiffValue)}</div>
                  <div className="text-right tabular-nums font-semibold text-primary">{item.increaseDiffQuantity}</div>
                  <div className="text-right tabular-nums font-semibold text-primary">{item.decreaseDiffQuantity}</div>
                  <div className="truncate text-muted-foreground">{item.note ?? "-"}</div>
                  <div className="text-right">
                    <CancelInventoryCheckButton
                      checkId={item.id}
                      canCancel={item.canCancel}
                      size="sm"
                    />
                  </div>
                </summary>

                {detail ? (
                  <div className="space-y-4 border-t bg-muted/10 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold tracking-tight">{detail.code}</h2>
                        <Badge className="status-badge-success">Đã cân bằng kho</Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p>
                        Người tạo: {detail.createdByName ?? "-"} {" | "} Ngày tạo:{" "}
                        {formatDate(detail.createdAt)}
                      </p>
                      <p>
                        Người cân bằng: {detail.createdByName ?? "-"} {" | "} Ngày cân bằng:{" "}
                        {formatDate(detail.balancedAt)}
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="border-b">
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Mã hàng</th>
                            <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tên hàng</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">Tồn kho</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">Thực tế</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">SL lệch</th>
                            <th className="h-10 px-4 text-right font-medium text-muted-foreground">Giá trị lệch</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.items.map((detailItem) => (
                            <tr key={detailItem.id} className="border-b last:border-b-0">
                              <td className="px-4 py-3 font-medium">{detailItem.sku}</td>
                              <td className="px-4 py-3">{detailItem.productName}</td>
                              <td className="px-4 py-3 text-right tabular-nums">{detailItem.bookStock}</td>
                              <td className="px-4 py-3 text-right tabular-nums">{detailItem.actualStock}</td>
                              <td className="px-4 py-3 text-right tabular-nums">{detailItem.diffQuantity}</td>
                              <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(detailItem.diffValue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[1fr_280px]">
                      <div className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center gap-3">
                          {detail.items[0]?.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={detail.items[0].thumbnailUrl}
                              alt={detail.items[0].productName}
                              className="h-12 w-12 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-[10px] text-muted-foreground">
                              IMG
                            </div>
                          )}

                          <div className="min-w-0">
                            <Link
                              href={`/products/${detail.items[0]?.productId ?? ""}`}
                              className="font-semibold text-primary hover:underline"
                            >
                              {detail.items[0]?.productName ?? "Sản phẩm"}
                            </Link>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {detail.note ?? "Không có ghi chú"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="flex justify-between gap-4">
                          <span>Tổng thực tế ({detail.actualQuantityTotal}):</span>
                          <span className="tabular-nums font-semibold text-primary">{formatCurrency(detail.actualValueTotal)}</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span>Tổng lệch tăng ({detail.increaseDiffQuantity}):</span>
                          <span className="tabular-nums font-semibold text-primary">{detail.increaseDiffQuantity}</span>
                        </p>
                        <p className="flex justify-between gap-4">
                          <span>Tổng lệch giảm ({detail.decreaseDiffQuantity}):</span>
                          <span className="tabular-nums font-semibold text-primary">{detail.decreaseDiffQuantity}</span>
                        </p>
                        <p className="flex justify-between gap-4 font-semibold">
                          <span>Tổng chênh lệch:</span>
                          <span className="tabular-nums font-semibold text-primary">{formatCurrency(String(detailTotalDiffValue))}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </details>
            );
          })
        )}
      </div>
    </div>
  );
}
