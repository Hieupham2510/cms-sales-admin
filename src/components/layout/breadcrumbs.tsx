"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

const LABEL_MAP: Record<string, string> = {
  dashboard: "Tổng quan",
  products: "Hàng hóa",
  customers: "Khách hàng",
  categories: "Nhóm hàng",
  brands: "Thương hiệu",
  locations: "Kho",
  suppliers: "Nhà cung cấp",
  inventory: "Kho",
  imports: "Nhập kho",
  exports: "Xuất kho",
  adjustments: "Phiếu kiểm kho",
  transactions: "Lịch sử kho",
  settings: "Cài đặt",
  login: "Đăng nhập",
  new: "Tạo mới",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const [productName, setProductName] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string | null>(null)

  const parts = useMemo(() => pathname.split("/").filter(Boolean), [pathname])
  const isProductDetailPage = parts[0] === "products" && parts.length === 2 && parts[1] !== "new"
  const isCustomerDetailPage = parts[0] === "customers" && parts.length === 2 && parts[1] !== "new"
  const productId = isProductDetailPage ? parts[1] : null
  const customerId = isCustomerDetailPage ? parts[1] : null

  useEffect(() => {
    let cancelled = false

    async function fetchProductName(id: string) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "GET",
          cache: "no-store",
        })
        if (!response.ok) {
          if (!cancelled) setProductName(null)
          return
        }

        const data = (await response.json()) as { name?: string | null }
        if (!cancelled) {
          setProductName(data.name ?? null)
        }
      } catch {
        if (!cancelled) setProductName(null)
      }
    }

    if (productId) {
      fetchProductName(productId)
    }

    return () => {
      cancelled = true
    }
  }, [productId])

  useEffect(() => {
    let cancelled = false

    async function fetchCustomerName(id: string) {
      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: "GET",
          cache: "no-store",
        })
        if (!response.ok) {
          if (!cancelled) setCustomerName(null)
          return
        }

        const data = (await response.json()) as { name?: string | null }
        if (!cancelled) {
          setCustomerName(data.name ?? null)
        }
      } catch {
        if (!cancelled) setCustomerName(null)
      }
    }

    if (customerId) {
      fetchCustomerName(customerId)
    }

    return () => {
      cancelled = true
    }
  }, [customerId])

  const crumbs = parts.map((part, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`
    const isProductIdCrumb = productId && part === productId
    const isCustomerIdCrumb = customerId && part === customerId
    const label = isProductIdCrumb
      ? (productName ?? part.toUpperCase())
      : isCustomerIdCrumb
        ? (customerName ?? part.toUpperCase())
        : (LABEL_MAP[part] ?? part.toUpperCase())

    return { href, label }
  })

  return (
    <nav className="min-w-0 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            href="/dashboard"
            className={
              pathname === "/dashboard"
                ? "font-semibold text-primary"
                : "transition-colors hover:text-primary"
            }
          >
            Dashboard
          </Link>
        </li>
        {crumbs.map((crumb) => {
          const isCurrent = crumb.href === pathname
          return (
          <li key={crumb.href} className="flex items-center gap-2">
            <span>/</span>
            <Link
              href={crumb.href}
              className={`max-w-[180px] truncate md:max-w-none ${
                isCurrent
                  ? "font-semibold text-primary"
                  : "transition-colors hover:text-primary"
              }`}
            >
              {crumb.label}
            </Link>
          </li>
          )
        })}
      </ol>
    </nav>
  )
}
