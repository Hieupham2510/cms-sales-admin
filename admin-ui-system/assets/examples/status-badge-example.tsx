import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ProductStatusBadge({
  status,
}: {
  status: "active" | "low_stock" | "out_of_stock" | "inactive"
}) {
  const map = {
    active: "border-transparent bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]",
    low_stock:
      "border-transparent bg-[hsl(var(--low-stock)/0.18)] text-[hsl(var(--low-stock))]",
    out_of_stock:
      "border-transparent bg-[hsl(var(--out-of-stock)/0.14)] text-[hsl(var(--out-of-stock))]",
    inactive:
      "border-transparent bg-[hsl(var(--inactive)/0.16)] text-[hsl(var(--inactive))]",
  }

  const label = {
    active: "Đang bán",
    low_stock: "Sắp hết",
    out_of_stock: "Hết hàng",
    inactive: "Ngừng bán",
  }

  return <Badge className={cn(map[status])}>{label[status]}</Badge>
}