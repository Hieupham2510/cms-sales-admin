export type SalesOrderStatus =
  | "processing"
  | "completed"
  | "failed_delivery"
  | "cancelled";

export type SalesPaymentMethod = "cash" | "bank_transfer" | "card" | "e_wallet";

export type SalesOrderStockIssue = {
  productId: string;
  sku: string;
  name: string;
  requestedQuantity: number;
  availableStock: number;
};
