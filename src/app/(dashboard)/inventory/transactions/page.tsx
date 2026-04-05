import { Badge } from "@/components/ui/badge"
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

export default function InventoryTransactionsPage() {
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
              {inventoryTransactions.map((item) => (
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
      </div>
    </div>
  )
}
