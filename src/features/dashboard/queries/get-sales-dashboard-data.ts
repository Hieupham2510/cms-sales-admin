import { and, eq, gte, inArray, lt, sql } from "drizzle-orm"
import { db } from "@/db"
import { customers, salesOrderItems, salesOrders } from "@/db/schema"
import { variantSummary, type SelectedVariant } from "@/features/products/variant-utils"
import type { SalesOrderStatus } from "@/features/sales/types"

const TIME_ZONE = "Asia/Ho_Chi_Minh"

const ORDER_COMPLETED_STATUS: SalesOrderStatus = "completed"
const ORDER_RETURN_STATUSES: SalesOrderStatus[] = ["failed_delivery", "cancelled"]
const ORDER_DASHBOARD_STATUSES: SalesOrderStatus[] = [
  ORDER_COMPLETED_STATUS,
  ...ORDER_RETURN_STATUSES,
]

export type DashboardTrendView = "daily" | "hourly" | "weekday"

export type DashboardOverview = {
  snapshotDate: string
  grossRevenue: number
  grossOrderCount: number
  returnValue: number
  returnOrderCount: number
  netRevenue: number
  netRevenueCurrentDay: number
  comparisonDate: string
  comparisonYesterdayDate: string
  comparisonSameDayLastMonthDate: string
  netRevenueYesterday: number
  netRevenueSameDayLastMonth: number
}

export type DashboardRevenueTrendPoint = {
  bucketKey: string
  label: string
  netRevenue: number
  grossRevenue: number
  orderCount: number
  returnValue: number
}

export type DashboardTopProduct = {
  productId: string
  sku: string
  productName: string
  variantName: string
  quantitySold: number
  netRevenue: number
  orderCount: number
}

export type DashboardTopCustomer = {
  customerId: string
  customerCode: string
  fullName: string
  segment: string | null
  orderCount: number
  totalItems: number
  netRevenue: number
  averageOrderValue: number
  lastOrderAt: string
}

export type DashboardDateRange = {
  from: string
  to: string
}

export type DashboardData = {
  dateRange: DashboardDateRange
  isSingleDayRange: boolean
  overview: DashboardOverview
  revenueTrend: Record<DashboardTrendView, DashboardRevenueTrendPoint[]>
  topProducts: DashboardTopProduct[]
  topCustomers: DashboardTopCustomer[]
}

type DashboardOrderRow = {
  id: string
  customerId: string
  status: string
  totalAmount: string
  soldAt: Date
}

type DashboardOrderItemRow = {
  orderId: string
  productId: string
  skuSnapshot: string
  nameSnapshot: string
  selectedVariants: SelectedVariant[]
  quantity: number
  lineTotal: string
}

type DateRangeBoundary = {
  start: Date
  endExclusive: Date
}

const dayLabelFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: TIME_ZONE,
  day: "2-digit",
})

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const hourLabelFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  hour12: false,
})

const weekdayKeyFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
})

const weekdayLabels: Record<string, string> = {
  mon: "Thứ 2",
  tue: "Thứ 3",
  wed: "Thứ 4",
  thu: "Thứ 5",
  fri: "Thứ 6",
  sat: "Thứ 7",
  sun: "Chủ nhật",
}

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return value
  return Number(value ?? 0)
}

function formatYmd(date: Date) {
  return dateKeyFormatter.format(date)
}

function parseYmdStart(value: string) {
  return new Date(`${value}T00:00:00+07:00`)
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function shiftMonth(date: Date, delta: number) {
  const clone = new Date(date)
  clone.setMonth(clone.getMonth() + delta)
  return clone
}

function buildDateRangeBoundary(range: DashboardDateRange): DateRangeBoundary {
  const start = parseYmdStart(range.from)
  const endExclusive = addDays(parseYmdStart(range.to), 1)
  return { start, endExclusive }
}

function getTodayYmd() {
  return formatYmd(new Date())
}

export function resolveDashboardDateRange(
  fromRaw?: string,
  toRaw?: string,
): DashboardDateRange {
  const today = getTodayYmd()
  const defaultFrom = formatYmd(addDays(parseYmdStart(today), -6))
  const from = /^\d{4}-\d{2}-\d{2}$/.test(fromRaw ?? "") ? (fromRaw as string) : defaultFrom
  const to = /^\d{4}-\d{2}-\d{2}$/.test(toRaw ?? "") ? (toRaw as string) : today

  if (from <= to) {
    return { from, to }
  }

  return { from: to, to: from }
}

async function getOrdersForRange(
  storeId: string,
  range: DateRangeBoundary,
): Promise<DashboardOrderRow[]> {
  return db
    .select({
      id: salesOrders.id,
      customerId: salesOrders.customerId,
      status: salesOrders.status,
      totalAmount: salesOrders.totalAmount,
      soldAt: salesOrders.soldAt,
    })
    .from(salesOrders)
    .where(
      and(
        eq(salesOrders.storeId, storeId),
        inArray(salesOrders.status, ORDER_DASHBOARD_STATUSES),
        gte(salesOrders.soldAt, range.start),
        lt(salesOrders.soldAt, range.endExclusive),
      ),
    )
}

async function getNetRevenueForRange(storeId: string, range: DateRangeBoundary) {
  const [row] = await db
    .select({
      netRevenue: sql<string>`
        COALESCE(
          SUM(
            CASE
              WHEN ${salesOrders.status} = ${ORDER_COMPLETED_STATUS} THEN ${salesOrders.totalAmount}
              WHEN ${salesOrders.status} IN (${sql.join(
                ORDER_RETURN_STATUSES.map((status) => sql`${status}`),
                sql`, `,
              )}) THEN -${salesOrders.totalAmount}
              ELSE 0
            END
          ),
          0
        )
      `,
    })
    .from(salesOrders)
    .where(
      and(
        eq(salesOrders.storeId, storeId),
        inArray(salesOrders.status, ORDER_DASHBOARD_STATUSES),
        gte(salesOrders.soldAt, range.start),
        lt(salesOrders.soldAt, range.endExclusive),
      ),
    )

  return toNumber(row?.netRevenue)
}

function buildOverview(
  currentOrders: DashboardOrderRow[],
  snapshotDate: string,
  netRevenueCurrentDay: number,
  comparisonDate: string,
  comparisonYesterdayDate: string,
  comparisonSameDayLastMonthDate: string,
  netRevenueYesterday: number,
  netRevenueSameDayLastMonth: number,
): DashboardOverview {
  const completedOrders = currentOrders.filter(
    (item) => item.status === ORDER_COMPLETED_STATUS,
  )
  const returnOrders = currentOrders.filter((item) =>
    ORDER_RETURN_STATUSES.includes(item.status as SalesOrderStatus),
  )

  const grossRevenue = completedOrders.reduce(
    (sum, item) => sum + toNumber(item.totalAmount),
    0,
  )
  const returnValue = returnOrders.reduce(
    (sum, item) => sum + toNumber(item.totalAmount),
    0,
  )

  return {
    snapshotDate,
    grossRevenue,
    grossOrderCount: completedOrders.length,
    returnValue,
    returnOrderCount: returnOrders.length,
    netRevenue: grossRevenue - returnValue,
    netRevenueCurrentDay,
    comparisonDate,
    comparisonYesterdayDate,
    comparisonSameDayLastMonthDate,
    netRevenueYesterday,
    netRevenueSameDayLastMonth,
  }
}

function buildRevenueTrend(
  orders: DashboardOrderRow[],
  range: DashboardDateRange,
): Record<DashboardTrendView, DashboardRevenueTrendPoint[]> {
  const dailyKeys: string[] = []
  const start = parseYmdStart(range.from)
  const end = parseYmdStart(range.to)
  for (let cursor = start; cursor.getTime() <= end.getTime(); cursor = addDays(cursor, 1)) {
    dailyKeys.push(formatYmd(cursor))
  }

  const dailyMap = new Map<string, DashboardRevenueTrendPoint>(
    dailyKeys.map((key) => [
      key,
      {
        bucketKey: key,
        label: dayLabelFormatter.format(parseYmdStart(key)),
        netRevenue: 0,
        grossRevenue: 0,
        orderCount: 0,
        returnValue: 0,
      },
    ]),
  )

  const hourlyMap = new Map<string, DashboardRevenueTrendPoint>(
    Array.from({ length: 24 }, (_, hour) => {
      const bucketKey = String(hour).padStart(2, "0")
      return [
        bucketKey,
        {
          bucketKey,
          label: `${bucketKey}h`,
          netRevenue: 0,
          grossRevenue: 0,
          orderCount: 0,
          returnValue: 0,
        },
      ] as const
    }),
  )

  const weekdayOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  const weekdayMap = new Map<string, DashboardRevenueTrendPoint>(
    weekdayOrder.map((key) => [
      key,
      {
        bucketKey: key,
        label: weekdayLabels[key],
        netRevenue: 0,
        grossRevenue: 0,
        orderCount: 0,
        returnValue: 0,
      },
    ]),
  )

  for (const order of orders) {
    const amount = toNumber(order.totalAmount)
    const isCompleted = order.status === ORDER_COMPLETED_STATUS
    const isReturn = ORDER_RETURN_STATUSES.includes(order.status as SalesOrderStatus)

    const dailyKey = formatYmd(order.soldAt)
    const hourlyKey = hourLabelFormatter.format(order.soldAt)
    const weekdayKey = weekdayKeyFormatter.format(order.soldAt).toLowerCase().slice(0, 3)

    for (const map of [dailyMap, hourlyMap, weekdayMap]) {
      const bucket =
        map === dailyMap
          ? map.get(dailyKey)
          : map === hourlyMap
            ? map.get(hourlyKey)
            : map.get(weekdayKey)

      if (!bucket) continue

      if (isCompleted) {
        bucket.grossRevenue += amount
        bucket.orderCount += 1
      } else if (isReturn) {
        bucket.returnValue += amount
      }

      bucket.netRevenue = bucket.grossRevenue - bucket.returnValue
    }
  }

  return {
    daily: Array.from(dailyMap.values()),
    hourly: Array.from(hourlyMap.values()),
    weekday: Array.from(weekdayMap.values()),
  }
}

async function getTopProducts(
  completedOrders: DashboardOrderRow[],
): Promise<DashboardTopProduct[]> {
  if (completedOrders.length === 0) return []

  const orderIds = completedOrders.map((item) => item.id)

  const itemRows = await db
    .select({
      orderId: salesOrderItems.orderId,
      productId: salesOrderItems.productId,
      skuSnapshot: salesOrderItems.skuSnapshot,
      nameSnapshot: salesOrderItems.nameSnapshot,
      selectedVariants: salesOrderItems.selectedVariants,
      quantity: salesOrderItems.quantity,
      lineTotal: salesOrderItems.lineTotal,
    })
    .from(salesOrderItems)
    .where(inArray(salesOrderItems.orderId, orderIds))

  const map = new Map<
    string,
    DashboardTopProduct & {
      orderIds: Set<string>
    }
  >()

  for (const item of itemRows as DashboardOrderItemRow[]) {
    const variantName = variantSummary(item.selectedVariants) || "Không chọn biến thể"
    const key = `${item.productId}:${variantName}`

    const current = map.get(key) ?? {
      productId: item.productId,
      sku: item.skuSnapshot,
      productName: item.nameSnapshot,
      variantName,
      quantitySold: 0,
      netRevenue: 0,
      orderCount: 0,
      orderIds: new Set<string>(),
    }

    current.quantitySold += item.quantity
    current.netRevenue += toNumber(item.lineTotal)
    current.orderIds.add(item.orderId)
    current.orderCount = current.orderIds.size

    map.set(key, current)
  }

  const output: DashboardTopProduct[] = []
  for (const item of map.values()) {
    output.push({
      productId: item.productId,
      sku: item.sku,
      productName: item.productName,
      variantName: item.variantName,
      quantitySold: item.quantitySold,
      netRevenue: item.netRevenue,
      orderCount: item.orderCount,
    })
  }

  return output.sort((a, b) => b.netRevenue - a.netRevenue).slice(0, 10)
}

async function getTopCustomers(
  completedOrders: DashboardOrderRow[],
): Promise<DashboardTopCustomer[]> {
  if (completedOrders.length === 0) return []

  const orderIds = completedOrders.map((item) => item.id)
  const customerIds = Array.from(new Set(completedOrders.map((item) => item.customerId)))

  const [itemRows, customerRows] = await Promise.all([
    db
      .select({
        orderId: salesOrderItems.orderId,
        quantity: salesOrderItems.quantity,
      })
      .from(salesOrderItems)
      .where(inArray(salesOrderItems.orderId, orderIds)),
    db
      .select({
        id: customers.id,
        code: customers.code,
        name: customers.name,
        groupName: customers.groupName,
      })
      .from(customers)
      .where(inArray(customers.id, customerIds)),
  ])

  const quantityByOrderId = new Map<string, number>()
  for (const item of itemRows) {
    quantityByOrderId.set(
      item.orderId,
      (quantityByOrderId.get(item.orderId) ?? 0) + item.quantity,
    )
  }

  const customerInfoMap = new Map(
    customerRows.map((item) => [item.id, item] as const),
  )

  const map = new Map<string, DashboardTopCustomer>()
  for (const order of completedOrders) {
    const customer = customerInfoMap.get(order.customerId)
    if (!customer) continue

    const current = map.get(customer.id) ?? {
      customerId: customer.id,
      customerCode: customer.code,
      fullName: customer.name,
      segment: customer.groupName,
      orderCount: 0,
      totalItems: 0,
      netRevenue: 0,
      averageOrderValue: 0,
      lastOrderAt: order.soldAt.toISOString(),
    }

    current.orderCount += 1
    current.totalItems += quantityByOrderId.get(order.id) ?? 0
    current.netRevenue += toNumber(order.totalAmount)
    if (new Date(order.soldAt).getTime() > new Date(current.lastOrderAt).getTime()) {
      current.lastOrderAt = new Date(order.soldAt).toISOString()
    }

    map.set(customer.id, current)
  }

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      averageOrderValue: item.orderCount > 0 ? item.netRevenue / item.orderCount : 0,
    }))
    .sort((a, b) => b.netRevenue - a.netRevenue)
    .slice(0, 10)
}

export async function getSalesDashboardData(params: {
  storeId: string
  from?: string
  to?: string
}): Promise<DashboardData> {
  const dateRange = resolveDashboardDateRange(params.from, params.to)
  const currentRange = buildDateRangeBoundary(dateRange)
  const todayYmd = getTodayYmd()
  const todayStart = parseYmdStart(todayYmd)
  const yesterdayYmd = formatYmd(addDays(todayStart, -1))
  const yesterdayStart = parseYmdStart(yesterdayYmd)
  const sameDayLastMonthYmd = formatYmd(shiftMonth(todayStart, -1))
  const sameDayLastMonthStart = parseYmdStart(sameDayLastMonthYmd)

  const yesterdayRange: DateRangeBoundary = {
    start: yesterdayStart,
    endExclusive: todayStart,
  }
  const sameDayLastMonthRange: DateRangeBoundary = {
    start: sameDayLastMonthStart,
    endExclusive: addDays(sameDayLastMonthStart, 1),
  }
  const todayRange: DateRangeBoundary = {
    start: todayStart,
    endExclusive: addDays(todayStart, 1),
  }

  const [
    currentOrders,
    netRevenueCurrentDay,
    netRevenueYesterday,
    netRevenueSameDayLastMonth,
  ] =
    await Promise.all([
      getOrdersForRange(params.storeId, currentRange),
      getNetRevenueForRange(params.storeId, todayRange),
      getNetRevenueForRange(params.storeId, yesterdayRange),
      getNetRevenueForRange(params.storeId, sameDayLastMonthRange),
    ])

  const completedOrders = currentOrders.filter(
    (item) => item.status === ORDER_COMPLETED_STATUS,
  )

  const [topProducts, topCustomers] = await Promise.all([
    getTopProducts(completedOrders),
    getTopCustomers(completedOrders),
  ])

  return {
    dateRange,
    isSingleDayRange: dateRange.from === dateRange.to,
    overview: buildOverview(
      currentOrders,
      dateRange.to,
      netRevenueCurrentDay,
      todayYmd,
      yesterdayYmd,
      sameDayLastMonthYmd,
      netRevenueYesterday,
      netRevenueSameDayLastMonth,
    ),
    revenueTrend: buildRevenueTrend(currentOrders, dateRange),
    topProducts,
    topCustomers,
  }
}
