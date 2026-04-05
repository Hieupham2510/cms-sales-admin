import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  status: string;
  currentStock: number;
  minStockAlert: number;
};

export function ProductStatusBadge({
  status,
  currentStock,
  minStockAlert,
}: Props) {
  let label = "Không xác định";
  let className = "status-badge-inactive";

  if (status === "inactive") {
    label = "Ngừng bán";
    className = "status-badge-inactive";
  } else if (currentStock <= 0) {
    label = "Hết hàng";
    className = "status-badge-out-of-stock";
  } else if (currentStock <= minStockAlert) {
    label = "Sắp hết";
    className = "status-badge-low-stock";
  } else {
    label = "Đang bán";
    className = "status-badge-success";
  }

  return <Badge className={cn(className)}>{label}</Badge>;
}