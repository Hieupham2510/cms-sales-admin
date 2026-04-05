export type ProductStatus = "Còn hàng" | "Sắp hết" | "Hết hàng" | "Lỗi" | "Ngừng bán"

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  supplier: string
  price: number
  stock: number
  status: ProductStatus
}

export interface Category {
  id: string
  name: string
  productCount: number
}

export interface Supplier {
  id: string
  name: string
  phone: string
  email: string
  status: "Đang hợp tác" | "Tạm dừng"
}

export interface InventoryTransaction {
  id: string
  type: "Nhập" | "Xuất" | "Điều chỉnh"
  productName: string
  quantity: number
  createdAt: string
  note?: string
}
