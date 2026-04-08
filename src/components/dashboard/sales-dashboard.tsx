import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, CircleHelp, RotateCcw, ShoppingBag } from "lucide-react"

import { MaiLinhLogo } from "@/components/brand/mai-linh-logo"
import { RevenueTrendBarChart } from "@/components/dashboard/revenue-trend-bar-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  type DashboardData,
  type DashboardTopCustomer,
  type DashboardTopProduct,
} from "@/features/dashboard/queries/get-sales-dashboard-data"
import { cn } from "@/lib/utils"

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
})

const compactCurrencyFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
})

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatCompactCurrency(value: number) {
  return compactCurrencyFormatter.format(value).replace(" ", "")
}

function formatPercentDelta(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0
  }
  return ((currentValue - previousValue) / previousValue) * 100
}

function SalesMetricCard({
  title,
  value,
  detail,
  formula,
  icon: Icon,
  tone = "neutral",
}: {
  title: string
  value: string
  detail: string
  formula: string
  icon: typeof ShoppingBag
  tone?: "neutral" | "destructive"
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="metric-label">{title}</p>
            <span title={formula} className="inline-flex cursor-help items-center text-muted-foreground">
              <CircleHelp className="size-3.5" />
            </span>
          </div>
          <p className="metric-value text-[1.6rem]">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            tone === "destructive"
              ? "bg-[hsl(var(--destructive)/0.12)] text-destructive"
              : "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

function RevenueComparisonCard({
  title,
  percentage,
  detail,
  formula,
  note,
}: {
  title: string
  percentage: number
  detail: string
  formula: string
  note: string
}) {
  const isPositive = percentage >= 0
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="metric-label">{title}</p>
            <span title={formula} className="inline-flex cursor-help items-center text-muted-foreground">
              <CircleHelp className="size-3.5" />
            </span>
          </div>
          <p className="metric-value text-[1.6rem]">{`${isPositive ? "+" : ""}${percentage.toFixed(2)}%`}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            isPositive
              ? "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]"
              : "bg-[hsl(var(--destructive)/0.12)] text-destructive",
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  )
}

function TopBarList({
  items,
  type,
}: {
  items: DashboardTopProduct[] | DashboardTopCustomer[]
  type: "products" | "customers"
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Không có dữ liệu trong khoảng thời gian đã chọn.
      </div>
    )
  }

  const maxValue = Math.max(...items.map((item) => item.netRevenue))

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isProduct = type === "products"
        const entryKey = isProduct
          ? `${(item as DashboardTopProduct).productId}:${(item as DashboardTopProduct).variantName}`
          : (item as DashboardTopCustomer).customerId

        const href = isProduct
          ? `/products?search=${encodeURIComponent((item as DashboardTopProduct).sku)}`
          : `/customers?search=${encodeURIComponent((item as DashboardTopCustomer).customerCode)}`

        const label = isProduct
          ? `${(item as DashboardTopProduct).productName} - ${(item as DashboardTopProduct).variantName}`
          : (item as DashboardTopCustomer).fullName
        const meta = isProduct
          ? `${(item as DashboardTopProduct).sku} • ${(item as DashboardTopProduct).quantitySold} sản phẩm`
          : `${(item as DashboardTopCustomer).customerCode} • ${(item as DashboardTopCustomer).orderCount} đơn hàng`

        return (
          <Link key={entryKey} href={href} className="block space-y-2 rounded-lg p-1 transition-colors hover:bg-muted/50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  <span className="mr-2 text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  {label}
                </p>
                <p className="text-xs text-muted-foreground">{meta}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular">{formatCompactCurrency(item.netRevenue)}</p>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${maxValue > 0 ? Math.max((item.netRevenue / maxValue) * 100, 8) : 0}%` }}
              />
            </div>
          </Link>
        )
      })}
    </div>
  )
}

type SalesDashboardProps = {
  storeName?: string | null
  storeLogoUrl?: string | null
  data: DashboardData
}

export function SalesDashboard({ storeName, storeLogoUrl, data }: SalesDashboardProps) {
  const { overview, revenueTrend, topProducts, topCustomers, dateRange, isSingleDayRange } = data
  const netRevenueVsYesterday = formatPercentDelta(
    overview.netRevenueCurrentDay,
    overview.netRevenueYesterday,
  )
  const netRevenueVsLastMonth = formatPercentDelta(
    overview.netRevenueCurrentDay,
    overview.netRevenueSameDayLastMonth,
  )

  const rangeLabel = isSingleDayRange
    ? formatYmdDateForDisplay(dateRange.from)
    : `${formatYmdDateForDisplay(dateRange.from)} - ${formatYmdDateForDisplay(dateRange.to)}`
  const filterNote = `Dữ liệu lọc từ ${formatYmdDateForDisplay(dateRange.from)} đến ${formatYmdDateForDisplay(dateRange.to)}`
  const yesterdayNote = `Mốc so sánh: ${formatYmdDateForDisplay(overview.comparisonDate)} và ${formatYmdDateForDisplay(overview.comparisonYesterdayDate)}`
  const sameDayLastMonthNote = `Mốc so sánh: ${formatYmdDateForDisplay(overview.comparisonDate)} và ${formatYmdDateForDisplay(overview.comparisonSameDayLastMonthDate)}`

  return (
    <div className="section-block">
      <div className="page-header rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="space-y-3">
          <MaiLinhLogo storeName={storeName} logoUrl={storeLogoUrl} />
          <div>
            <h1 className="page-title">Tổng quan bán hàng</h1>
            <p className="page-description">
              Theo dõi doanh thu, sản phẩm chủ lực và nhịp vận hành của {storeName ?? "cửa hàng"}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-7 rounded-full px-3 text-xs">
            {rangeLabel}
          </Badge>
          <form method="get" className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              name="from"
              defaultValue={dateRange.from}
              className="h-8 w-36"
              aria-label="Từ ngày"
            />
            <Input
              type="date"
              name="to"
              defaultValue={dateRange.to}
              className="h-8 w-36"
              aria-label="Đến ngày"
            />
            <Button type="submit" variant="outline" size="sm">
              Áp dụng
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-4">
          <Card className="app-card">
            <CardHeader className="border-b">
              <CardTitle className="section-title">Kết quả bán hàng</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-4">
              <SalesMetricCard
                title="Doanh thu"
                value={formatCurrency(overview.grossRevenue)}
                detail={`${overview.grossOrderCount} hóa đơn thành công`}
                formula="Doanh thu = tổng giá trị tất cả đơn hàng ở trạng thái Hoàn thành"
                icon={ShoppingBag}
              />
              <SalesMetricCard
                title="Trả hàng"
                value={formatCurrency(overview.returnValue)}
                detail={`${overview.returnOrderCount} đơn không giao được / đã hủy`}
                formula="Trả hàng = tổng giá trị các đơn ở trạng thái Không giao được hoặc Đã hủy"
                icon={RotateCcw}
                tone="destructive"
              />
              <RevenueComparisonCard
                title="Doanh thu thuần so với hôm qua"
                percentage={netRevenueVsYesterday}
                detail={`Doanh thu thuần ngày ${formatYmdDateForDisplay(overview.comparisonDate)}: ${formatCurrency(overview.netRevenueCurrentDay)}; ngày ${formatYmdDateForDisplay(overview.comparisonYesterdayDate)}: ${formatCurrency(overview.netRevenueYesterday)}`}
                formula="% thay đổi = (Doanh thu thuần hiện tại - Doanh thu thuần hôm qua) / Doanh thu thuần hôm qua × 100%"
                note={yesterdayNote}
              />
              <RevenueComparisonCard
                title="Doanh thu thuần so với cùng kỳ tháng trước"
                percentage={netRevenueVsLastMonth}
                detail={`Doanh thu thuần ngày ${formatYmdDateForDisplay(overview.comparisonDate)}: ${formatCurrency(overview.netRevenueCurrentDay)}; ngày ${formatYmdDateForDisplay(overview.comparisonSameDayLastMonthDate)}: ${formatCurrency(overview.netRevenueSameDayLastMonth)}`}
                formula="% tăng trưởng = (Doanh thu thuần ngày hiện tại - Doanh thu thuần cùng ngày tháng trước) / Doanh thu thuần cùng ngày tháng trước × 100%"
                note={sameDayLastMonthNote}
              />
            </CardContent>
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground">{filterNote}</p>
            </div>
          </Card>

          <Card className="app-card">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="section-title">Doanh thu thuần</CardTitle>
                    <span
                      title="Doanh thu thuần = Doanh thu - Trả hàng"
                      className="inline-flex cursor-help items-center text-muted-foreground"
                    >
                      <CircleHelp className="size-3.5" />
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="h-8 rounded-full px-3 text-sm">{formatCurrency(overview.netRevenue)}</Badge>
                    <p className="text-sm text-muted-foreground">Doanh thu thuần trong khoảng thời gian đã chọn.</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{filterNote}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <RevenueTrendBarChart points={revenueTrend.daily} />
            </CardContent>
          </Card>

          <div className="grid gap-4 2xl:grid-cols-2">
            <Card className="app-card">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="section-title">Top 10 hàng bán chạy</CardTitle>
                    <span
                      title="Xếp hạng theo doanh thu thuần = tổng giá trị bán thành công của từng mặt hàng trong khoảng lọc"
                      className="inline-flex cursor-help items-center text-muted-foreground"
                    >
                      <CircleHelp className="size-3.5" />
                    </span>
                  </div>
                  <Badge variant="outline" className="h-8 rounded-full px-3 text-xs">
                    Theo doanh thu thuần
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{filterNote}</p>
              </CardHeader>
              <CardContent className="p-4">
                <TopBarList items={topProducts} type="products" />
              </CardContent>
            </Card>

            <Card className="app-card">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="section-title">Top 10 khách mua nhiều nhất</CardTitle>
                    <span
                      title="Xếp hạng theo doanh thu thuần = tổng giá trị mua thành công của từng khách hàng trong khoảng lọc"
                      className="inline-flex cursor-help items-center text-muted-foreground"
                    >
                      <CircleHelp className="size-3.5" />
                    </span>
                  </div>
                  <Badge variant="outline" className="h-8 rounded-full px-3 text-xs">
                    Theo doanh thu thuần
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{filterNote}</p>
              </CardHeader>
              <CardContent className="p-4">
                <TopBarList items={topCustomers} type="customers" />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="app-card hidden" aria-hidden>
          <CardHeader className="border-b">
            <CardTitle className="section-title">Danh sách hoạt động</CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Tạm ẩn để phát triển ở giai đoạn sau.
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">
        Cập nhật gần nhất: {dateTimeFormatter.format(new Date(`${overview.snapshotDate}T23:59:00+07:00`))}
      </p>
    </div>
  )
}

function formatYmdDateForDisplay(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+07:00`))
}
