import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { inventoryTransactions } from "@/lib/mock-data"
import { TABLE_PAGE_SIZE } from "@/lib/constants"
import type { InventoryTransaction } from "@/types/product"

const transactionBadgeClass: Record<InventoryTransaction["type"], string> = {
  Nhập: "status-badge-success",
  Xuất: "status-badge-info",
  "Điều chỉnh": "status-badge-warning",
}

function quantityColor(type: InventoryTransaction["type"], quantity: number) {
  if (type === "Nhập") return "text-[hsl(var(--success))]"
  if (type === "Xuất") return "text-[hsl(var(--info))]"
  if (quantity < 0) return "text-[hsl(var(--destructive))]"
  return "text-[hsl(var(--warning))]"
}

export default async function InventoryTransactionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>
}) {
  const params = (await searchParams) ?? {}
  const requestedPage = Number(params.page ?? "1")
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const totalItems = inventoryTransactions.length
  const totalPages = Math.max(1, Math.ceil(totalItems / TABLE_PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const start = (safePage - 1) * TABLE_PAGE_SIZE
  const pageData = inventoryTransactions.slice(start, start + TABLE_PAGE_SIZE)

  return (
    <div className="section-block">
      <PageHeader title="Giao dịch kho" description="Lịch sử nhập, xuất và điều chỉnh." />

      <div className="table-shell">
        <div className="table-content">
          <Table className="table-compact">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Mã GD</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="sku-text">{item.id}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={transactionBadgeClass[item.type]}>{item.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className={cn("text-right tabular font-semibold", quantityColor(item.type, item.quantity))}>
                    {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.createdAt}</TableCell>
                  <TableCell className="text-muted-foreground">{item.note ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalItems > TABLE_PAGE_SIZE ? (
          <div className="flex flex-col items-center justify-between gap-2 border-t px-4 py-3 text-sm text-muted-foreground md:flex-row">
            <p>
              Hiển thị {start + 1}-{Math.min(start + TABLE_PAGE_SIZE, totalItems)} / {totalItems}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                render={<Link href={`/inventory/transactions?page=${Math.max(1, safePage - 1)}`} />}
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
                render={<Link href={`/inventory/transactions?page=${Math.min(totalPages, safePage + 1)}`} />}
                nativeButton={false}
              >
                Sau
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
