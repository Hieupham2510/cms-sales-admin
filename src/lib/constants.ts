import type { LucideIcon } from "lucide-react"
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  MapPinHouse,
  ReceiptText,
  ShoppingCart,
  Tags,
  Users,
} from "lucide-react"

export const APP_NAME = "Áo dài Mai Linh"

export interface DashboardNavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface DashboardNavGroup {
  label: string
  items: DashboardNavItem[]
}

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: "Điều hành",
    items: [{ label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Bán hàng",
    items: [
      { label: "Bán hàng", href: "/sales", icon: ShoppingCart },
      { label: "Đơn bán", href: "/sales/orders", icon: ReceiptText },
      { label: "Khách hàng", href: "/customers", icon: Users },
    ],
  },
  {
    label: "Hàng hóa",
    items: [
      { label: "Hàng hóa", href: "/products", icon: Boxes },
      { label: "Nhóm hàng", href: "/categories", icon: Tags },
      { label: "Thương hiệu", href: "/brands", icon: Tags },
    ],
  },
  {
    label: "Kho",
    items: [
      { label: "Kho", href: "/locations", icon: MapPinHouse },
      { label: "Phiếu kiểm kho", href: "/inventory/adjustments", icon: ClipboardList },
    ],
  },
]

export function getDashboardNavGroupsByRole(role: "admin" | "manager" | "staff") {
  if (role !== "staff") {
    return DASHBOARD_NAV_GROUPS;
  }

  return DASHBOARD_NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.href !== "/dashboard"),
    }))
    .filter((group) => group.items.length > 0);
}
