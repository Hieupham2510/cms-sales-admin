import type { Category, InventoryTransaction, Product, Supplier } from "@/types/product"

export const products: Product[] = [
  {
    id: "P001",
    sku: "SKU-TAO-001",
    name: "Táo Envy nhập khẩu",
    category: "Trái cây",
    supplier: "Fresh Farm",
    price: 95000,
    stock: 120,
    status: "Còn hàng",
  },
  {
    id: "P002",
    sku: "SKU-SUA-002",
    name: "Sữa hạt óc chó",
    category: "Đồ uống",
    supplier: "Green Foods",
    price: 58000,
    stock: 18,
    status: "Sắp hết",
  },
  {
    id: "P003",
    sku: "SKU-MI-003",
    name: "Mì Ý nguyên cám",
    category: "Thực phẩm khô",
    supplier: "Viet Pantry",
    price: 42000,
    stock: 0,
    status: "Hết hàng",
  },
  {
    id: "P004",
    sku: "SKU-NUOC-004",
    name: "Nước ép mix berries",
    category: "Đồ uống",
    supplier: "Green Foods",
    price: 67000,
    stock: 5,
    status: "Ngừng bán",
  },
]

export const categories: Category[] = [
  { id: "C01", name: "Trái cây", productCount: 32 },
  { id: "C02", name: "Đồ uống", productCount: 18 },
  { id: "C03", name: "Thực phẩm khô", productCount: 24 },
]

export const suppliers: Supplier[] = [
  {
    id: "S01",
    name: "Fresh Farm",
    phone: "0901 222 333",
    email: "sales@freshfarm.vn",
    status: "Đang hợp tác",
  },
  {
    id: "S02",
    name: "Green Foods",
    phone: "0908 123 888",
    email: "hello@greenfoods.vn",
    status: "Đang hợp tác",
  },
  {
    id: "S03",
    name: "Viet Pantry",
    phone: "028 3888 6688",
    email: "contact@vietpantry.vn",
    status: "Tạm dừng",
  },
]

export const inventoryTransactions: InventoryTransaction[] = [
  {
    id: "T001",
    type: "Nhập",
    productName: "Táo Envy nhập khẩu",
    quantity: 50,
    createdAt: "2026-03-24 09:15",
    note: "Nhập theo PO-1024",
  },
  {
    id: "T002",
    type: "Xuất",
    productName: "Sữa hạt óc chó",
    quantity: 12,
    createdAt: "2026-03-24 15:40",
  },
  {
    id: "T003",
    type: "Điều chỉnh",
    productName: "Mì Ý nguyên cám",
    quantity: -2,
    createdAt: "2026-03-25 08:05",
    note: "Hàng lỗi bao bì",
  },
]

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}
