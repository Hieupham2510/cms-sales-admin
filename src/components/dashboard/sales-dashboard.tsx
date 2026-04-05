import { ArrowDownRight, ArrowUpRight, Clock3, PackageCheck, RotateCcw, ShoppingBag, Users } from "lucide-react"

import { MaiLinhLogo } from "@/components/brand/mai-linh-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  dashboardMockData,
  type ActivityFeedItem,
  type RevenueTrendPoint,
  type TopCustomer,
  type TopSellingProduct,
  type TrendView,
} from "@/lib/dashboard-mock"
import { cn } from "@/lib/utils"

const trendTabs: { value: TrendView; label: string }[] = [
  { value: "daily", label: "Theo ngày" },
  { value: "hourly", label: "Theo giờ" },
  { value: "weekday", label: "Theo thứ" },
]

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

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatCompactCurrency(value: number) {
  return compactCurrencyFormatter.format(value).replace(" ", "")
}

function formatPercentDelta(currentValue: number, previousValue: number) {
  if (previousValue === 0) return 0
  return ((currentValue - previousValue) / previousValue) * 100
}

function getYAxisTicks(points: RevenueTrendPoint[]) {
  const maxValue = Math.max(...points.map((point) => point.netRevenue))
  const roundedMax = Math.ceil(maxValue / 10000000) * 10000000
  return Array.from({ length: 5 }, (_, index) => {
    const step = roundedMax / 4
    return roundedMax - step * index
  })
}

function formatTickValue(value: number) {
  const millions = value / 1000000
  return millions >= 1000 ? `${(millions / 1000).toFixed(1)} tỷ` : `${Math.round(millions)} tr`
}

function getActivityMeta(item: ActivityFeedItem) {
  switch (item.actionType) {
    case "sale_created":
      return {
        icon: ShoppingBag,
        surfaceClassName: "bg-accent text-accent-foreground",
        accentClassName: "text-primary",
      }
    case "return_created":
      return {
        icon: RotateCcw,
        surfaceClassName: "bg-[hsl(var(--destructive)/0.12)] text-destructive",
        accentClassName: "text-destructive",
      }
    case "inventory_received":
      return {
        icon: PackageCheck,
        surfaceClassName: "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]",
        accentClassName: "text-[hsl(var(--success))]",
      }
    case "customer_created":
      return {
        icon: Users,
        surfaceClassName: "bg-[hsl(var(--info)/0.12)] text-[hsl(var(--info))]",
        accentClassName: "text-[hsl(var(--info))]",
      }
  }
}

function SalesMetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: {
  title: string
  value: string
  detail: string
  icon: typeof ShoppingBag
  tone?: "neutral" | "destructive"
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="metric-label">{title}</p>
          <p className="metric-value text-[1.6rem]">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            tone === "destructive"
              ? "bg-[hsl(var(--destructive)/0.12)] text-destructive"
              : "bg-accent text-accent-foreground"
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
}: {
  title: string
  percentage: number
  detail: string
}) {
  const isPositive = percentage >= 0
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="metric-label">{title}</p>
          <p className="metric-value text-[1.6rem]">{`${isPositive ? "+" : ""}${percentage.toFixed(2)}%`}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            isPositive
              ? "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]"
              : "bg-[hsl(var(--destructive)/0.12)] text-destructive"
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

function RevenueBarsChart({ points }: { points: RevenueTrendPoint[] }) {
  const maxValue = Math.max(...points.map((point) => point.netRevenue))
  const yAxisTicks = getYAxisTicks(points)

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3">
        <div className="grid h-[20rem] content-between pt-2 text-xs text-muted-foreground">
          {yAxisTicks.map((tick) => (
            <span key={tick} className="text-right tabular">
              {formatTickValue(tick)}
            </span>
          ))}
          <span className="text-right tabular">0</span>
        </div>

        <div className="relative h-[20rem]">
          <div className="pointer-events-none absolute inset-0 grid grid-rows-5">
            {yAxisTicks.map((tick) => (
              <div key={tick} className="border-t border-dashed border-border" />
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 top-2 flex items-end gap-2">
            {points.map((point) => (
              <div key={point.bucketKey} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <div className="group relative flex h-full w-full items-end justify-center">
                  <div
                    className="w-full max-w-7 rounded-t-md bg-primary/90 transition-colors group-hover:bg-primary"
                    style={{ height: `${Math.max((point.netRevenue / maxValue) * 100, 6)}%` }}
                    title={`${point.label}: ${formatCurrency(point.netRevenue)}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TopBarList({
  items,
  type,
}: {
  items: TopSellingProduct[] | TopCustomer[]
  type: "products" | "customers"
}) {
  const maxValue = Math.max(...items.map((item) => item.netRevenue))

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isProduct = type === "products"
        const entryKey = isProduct
          ? (item as TopSellingProduct).productId
          : (item as TopCustomer).customerId
        const label = isProduct
          ? `${(item as TopSellingProduct).productName} - ${(item as TopSellingProduct).variantName}`
          : `${(item as TopCustomer).fullName} - ${(item as TopCustomer).location}`
        const meta = isProduct
          ? `${(item as TopSellingProduct).sku} • ${(item as TopSellingProduct).quantitySold} sản phẩm`
          : `${(item as TopCustomer).customerCode} • ${(item as TopCustomer).orderCount} đơn hàng`

        return (
          <div key={entryKey} className="space-y-2">
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
                style={{ width: `${Math.max((item.netRevenue / maxValue) * 100, 8)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  return (
    <div className="space-y-5">
      {items.map((item, index) => {
        const { icon: Icon, surfaceClassName, accentClassName } = getActivityMeta(item)

        return (
          <div key={item.id} className="relative flex gap-3">
            {index !== items.length - 1 ? (
              <span className="absolute left-[1.15rem] top-12 h-[calc(100%-2rem)] w-px bg-border" />
            ) : null}
            <div className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", surfaceClassName)}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm leading-6 text-foreground">
                <span className={cn("font-semibold", accentClassName)}>{item.actorName}</span> {item.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{item.entityCode}</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>{item.branchName}</span>
              </div>
              {item.amount > 0 ? <p className="text-sm font-semibold tabular">{formatCurrency(item.amount)}</p> : null}
              <p className="text-xs text-muted-foreground">{item.relativeTimeLabel}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function SalesDashboard() {
  const { overview, revenueTrend, topProducts, topCustomers, activityFeed } = dashboardMockData
  const netRevenueVsYesterday = formatPercentDelta(overview.netRevenue, overview.netRevenueYesterday)
  const netRevenueVsLastMonth = formatPercentDelta(overview.netRevenue, overview.netRevenueSameDayLastMonth)

  return (
    <div className="section-block">
      <div className="page-header rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="space-y-3">
          <MaiLinhLogo />
          <div>
            <h1 className="page-title">Tổng quan bán hàng</h1>
            <p className="page-description">
              Theo dõi doanh thu, sản phẩm chủ lực và nhịp vận hành của Áo dài Mai Linh trong ngày.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-7 rounded-full px-3 text-xs">
            {overview.branchName}
          </Badge>
          <Button variant="outline" size="sm">
            {overview.snapshotDate}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Card className="app-card">
            <CardHeader className="border-b">
              <CardTitle className="section-title">Kết quả bán hàng hôm nay</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-4">
              <SalesMetricCard
                title="Doanh thu"
                value={formatCurrency(overview.grossRevenue)}
                detail={`${overview.grossOrderCount} hóa đơn thành công`}
                icon={ShoppingBag}
              />
              <SalesMetricCard
                title="Trả hàng"
                value={formatCurrency(overview.returnValue)}
                detail={`${overview.returnOrderCount} giao dịch trả hàng`}
                icon={RotateCcw}
                tone="destructive"
              />
              <RevenueComparisonCard
                title="Doanh thu thuần"
                percentage={netRevenueVsYesterday}
                detail={`So với hôm qua: ${formatCurrency(overview.netRevenueYesterday)}`}
              />
              <RevenueComparisonCard
                title="Doanh thu thuần"
                percentage={netRevenueVsLastMonth}
                detail={`So với cùng kỳ tháng trước: ${formatCurrency(overview.netRevenueSameDayLastMonth)}`}
              />
            </CardContent>
          </Card>

          <Card className="app-card">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <CardTitle className="section-title">Doanh thu thuần</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="h-8 rounded-full px-3 text-sm">{formatCurrency(overview.netRevenue)}</Badge>
                    <p className="text-sm text-muted-foreground">
                      Tổng doanh thu thu về sau trả hàng tại {overview.branchName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Tháng này
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <Tabs defaultValue="daily" className="space-y-5">
                <TabsList variant="line" className="gap-5 p-0">
                  {trendTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="rounded-none px-0 pb-2 text-sm data-active:text-primary"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {trendTabs.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value}>
                    <RevenueBarsChart points={revenueTrend[tab.value]} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <div className="grid gap-4 2xl:grid-cols-2">
            <Card className="app-card">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="section-title">Top 10 hàng bán chạy</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      Theo doanh thu thuần
                    </Button>
                    <Button variant="outline" size="sm">
                      Tháng này
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <TopBarList items={topProducts} type="products" />
              </CardContent>
            </Card>

            <Card className="app-card">
              <CardHeader className="border-b">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="section-title">Top 10 khách mua nhiều nhất</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Tháng này
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <TopBarList items={topCustomers} type="customers" />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="app-card h-fit xl:sticky xl:top-6">
          <CardHeader className="border-b">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="section-title">Danh sách hoạt động</CardTitle>
                  <p className="text-sm text-muted-foreground">Cập nhật giao dịch, kho và khách hàng gần đây.</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Clock3 className="size-4" />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium text-foreground">Cần kiểm tra 1 phiếu trả hàng phát sinh trong ngày.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Giá trị trả hàng chiếm {((overview.returnValue / overview.grossRevenue) * 100).toFixed(1)}% doanh thu gộp.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-14rem)] overflow-y-auto p-4">
            <ActivityFeed items={activityFeed} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
