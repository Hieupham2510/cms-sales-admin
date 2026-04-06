import type { SalesOrderStatus } from "./types";
import type { SalesPaymentMethod } from "./types";

export function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function salesOrderStatusLabel(status: SalesOrderStatus | string) {
  switch (status) {
    case "processing":
      return "Đang xử lý";
    case "completed":
      return "Hoàn thành";
    case "failed_delivery":
      return "Không giao được";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

export function salesOrderStatusBadgeClass(status: SalesOrderStatus | string) {
  switch (status) {
    case "completed":
      return "status-badge-success";
    case "processing":
      return "status-badge-warning";
    case "failed_delivery":
      return "bg-destructive/15 text-destructive border-transparent";
    case "cancelled":
      return "bg-destructive/15 text-destructive border-transparent";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function salesPaymentMethodLabel(method: SalesPaymentMethod | string) {
  switch (method) {
    case "cash":
      return "Tiền mặt";
    case "bank_transfer":
      return "Chuyển khoản";
    case "card":
      return "Thẻ";
    case "e_wallet":
      return "Ví điện tử";
    default:
      return method;
  }
}
