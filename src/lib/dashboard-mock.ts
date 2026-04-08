export type TrendView = "daily" | "hourly" | "weekday"

export interface SalesOverviewSnapshot {
  snapshotDate: string
  storeId: string
  storeName: string
  branchId: string
  branchName: string
  grossRevenue: number
  grossOrderCount: number
  returnValue: number
  returnOrderCount: number
  netRevenue: number
  netRevenueYesterday: number
  netRevenueSameDayLastMonth: number
}

export interface RevenueTrendPoint {
  bucketKey: string
  label: string
  netRevenue: number
  grossRevenue: number
  orderCount: number
  returnValue: number
}

export interface TopSellingProduct {
  productId: string
  sku: string
  productName: string
  variantName: string
  categoryName: string
  quantitySold: number
  grossRevenue: number
  netRevenue: number
  returnQuantity: number
  orderCount: number
}

export interface TopCustomer {
  customerId: string
  customerCode: string
  fullName: string
  segment: "VIP" | "Than thiet" | "Moi"
  location: string
  orderCount: number
  totalItems: number
  netRevenue: number
  averageOrderValue: number
  lastOrderAt: string
}

export interface ActivityFeedItem {
  id: string
  occurredAt: string
  relativeTimeLabel: string
  actorId: string
  actorName: string
  actorRole: string
  actionType: "sale_created" | "return_created" | "inventory_received" | "customer_created"
  entityType: "order" | "return" | "receipt" | "customer"
  entityCode: string
  description: string
  amount: number
  branchName: string
}

export interface DashboardMockData {
  overview: SalesOverviewSnapshot
  revenueTrend: Record<TrendView, RevenueTrendPoint[]>
  topProducts: TopSellingProduct[]
  topCustomers: TopCustomer[]
  activityFeed: ActivityFeedItem[]
}

const dailyTrend: RevenueTrendPoint[] = [
  { bucketKey: "2026-03-01", label: "01", netRevenue: 18200000, grossRevenue: 19400000, orderCount: 13, returnValue: 1200000 },
  { bucketKey: "2026-03-02", label: "02", netRevenue: 26400000, grossRevenue: 27800000, orderCount: 18, returnValue: 1400000 },
  { bucketKey: "2026-03-03", label: "03", netRevenue: 49800000, grossRevenue: 51600000, orderCount: 27, returnValue: 1800000 },
  { bucketKey: "2026-03-04", label: "04", netRevenue: 36200000, grossRevenue: 37400000, orderCount: 22, returnValue: 1200000 },
  { bucketKey: "2026-03-05", label: "05", netRevenue: 13600000, grossRevenue: 14400000, orderCount: 11, returnValue: 800000 },
  { bucketKey: "2026-03-06", label: "06", netRevenue: 53200000, grossRevenue: 54400000, orderCount: 29, returnValue: 1200000 },
  { bucketKey: "2026-03-07", label: "07", netRevenue: 49800000, grossRevenue: 51200000, orderCount: 28, returnValue: 1400000 },
  { bucketKey: "2026-03-08", label: "08", netRevenue: 17600000, grossRevenue: 18200000, orderCount: 12, returnValue: 600000 },
  { bucketKey: "2026-03-09", label: "09", netRevenue: 26400000, grossRevenue: 27600000, orderCount: 17, returnValue: 1200000 },
  { bucketKey: "2026-03-10", label: "10", netRevenue: 18200000, grossRevenue: 19400000, orderCount: 12, returnValue: 1200000 },
  { bucketKey: "2026-03-11", label: "11", netRevenue: 61200000, grossRevenue: 62800000, orderCount: 34, returnValue: 1600000 },
  { bucketKey: "2026-03-12", label: "12", netRevenue: 37400000, grossRevenue: 38600000, orderCount: 20, returnValue: 1200000 },
  { bucketKey: "2026-03-13", label: "13", netRevenue: 35800000, grossRevenue: 36900000, orderCount: 19, returnValue: 1100000 },
  { bucketKey: "2026-03-14", label: "14", netRevenue: 30200000, grossRevenue: 31400000, orderCount: 18, returnValue: 1200000 },
  { bucketKey: "2026-03-15", label: "15", netRevenue: 60600000, grossRevenue: 62200000, orderCount: 31, returnValue: 1600000 },
  { bucketKey: "2026-03-16", label: "16", netRevenue: 41800000, grossRevenue: 42900000, orderCount: 23, returnValue: 1100000 },
  { bucketKey: "2026-03-17", label: "17", netRevenue: 33600000, grossRevenue: 34800000, orderCount: 17, returnValue: 1200000 },
  { bucketKey: "2026-03-18", label: "18", netRevenue: 48600000, grossRevenue: 50100000, orderCount: 26, returnValue: 1500000 },
  { bucketKey: "2026-03-19", label: "19", netRevenue: 14400000, grossRevenue: 15000000, orderCount: 10, returnValue: 600000 },
  { bucketKey: "2026-03-20", label: "20", netRevenue: 55600000, grossRevenue: 57100000, orderCount: 30, returnValue: 1500000 },
  { bucketKey: "2026-03-21", label: "21", netRevenue: 61200000, grossRevenue: 62900000, orderCount: 32, returnValue: 1700000 },
  { bucketKey: "2026-03-22", label: "22", netRevenue: 43200000, grossRevenue: 44800000, orderCount: 24, returnValue: 1600000 },
  { bucketKey: "2026-03-23", label: "23", netRevenue: 49200000, grossRevenue: 50500000, orderCount: 25, returnValue: 1300000 },
  { bucketKey: "2026-03-24", label: "24", netRevenue: 24600000, grossRevenue: 25800000, orderCount: 14, returnValue: 1200000 },
  { bucketKey: "2026-03-25", label: "25", netRevenue: 61800000, grossRevenue: 63600000, orderCount: 33, returnValue: 1800000 },
  { bucketKey: "2026-03-26", label: "26", netRevenue: 59400000, grossRevenue: 60900000, orderCount: 31, returnValue: 1500000 },
  { bucketKey: "2026-03-27", label: "27", netRevenue: 49800000, grossRevenue: 51400000, orderCount: 27, returnValue: 1600000 },
  { bucketKey: "2026-03-28", label: "28", netRevenue: 48800000, grossRevenue: 50100000, orderCount: 26, returnValue: 1300000 },
  { bucketKey: "2026-03-29", label: "29", netRevenue: 47600000, grossRevenue: 49000000, orderCount: 25, returnValue: 1400000 },
  { bucketKey: "2026-03-30", label: "30", netRevenue: 15200000, grossRevenue: 16400000, orderCount: 9, returnValue: 1200000 },
]

const hourlyTrend: RevenueTrendPoint[] = [
  { bucketKey: "08", label: "08h", netRevenue: 3200000, grossRevenue: 3400000, orderCount: 3, returnValue: 200000 },
  { bucketKey: "09", label: "09h", netRevenue: 5400000, grossRevenue: 5600000, orderCount: 4, returnValue: 200000 },
  { bucketKey: "10", label: "10h", netRevenue: 11800000, grossRevenue: 12200000, orderCount: 8, returnValue: 400000 },
  { bucketKey: "11", label: "11h", netRevenue: 15200000, grossRevenue: 15800000, orderCount: 10, returnValue: 600000 },
  { bucketKey: "12", label: "12h", netRevenue: 9800000, grossRevenue: 10200000, orderCount: 7, returnValue: 400000 },
  { bucketKey: "13", label: "13h", netRevenue: 7200000, grossRevenue: 7600000, orderCount: 5, returnValue: 400000 },
  { bucketKey: "14", label: "14h", netRevenue: 13600000, grossRevenue: 14200000, orderCount: 9, returnValue: 600000 },
  { bucketKey: "15", label: "15h", netRevenue: 18400000, grossRevenue: 19000000, orderCount: 11, returnValue: 600000 },
  { bucketKey: "16", label: "16h", netRevenue: 12200000, grossRevenue: 12800000, orderCount: 8, returnValue: 600000 },
  { bucketKey: "17", label: "17h", netRevenue: 16800000, grossRevenue: 17300000, orderCount: 10, returnValue: 500000 },
  { bucketKey: "18", label: "18h", netRevenue: 21400000, grossRevenue: 22000000, orderCount: 13, returnValue: 600000 },
  { bucketKey: "19", label: "19h", netRevenue: 24600000, grossRevenue: 25400000, orderCount: 15, returnValue: 800000 },
  { bucketKey: "20", label: "20h", netRevenue: 20800000, grossRevenue: 21400000, orderCount: 12, returnValue: 600000 },
  { bucketKey: "21", label: "21h", netRevenue: 11800000, grossRevenue: 12100000, orderCount: 7, returnValue: 300000 },
]

const weekdayTrend: RevenueTrendPoint[] = [
  { bucketKey: "mon", label: "Thu 2", netRevenue: 182400000, grossRevenue: 188000000, orderCount: 102, returnValue: 5600000 },
  { bucketKey: "tue", label: "Thu 3", netRevenue: 214600000, grossRevenue: 221300000, orderCount: 116, returnValue: 6700000 },
  { bucketKey: "wed", label: "Thu 4", netRevenue: 208300000, grossRevenue: 214100000, orderCount: 111, returnValue: 5800000 },
  { bucketKey: "thu", label: "Thu 5", netRevenue: 226500000, grossRevenue: 233700000, orderCount: 123, returnValue: 7200000 },
  { bucketKey: "fri", label: "Thu 6", netRevenue: 247200000, grossRevenue: 255400000, orderCount: 134, returnValue: 8200000 },
  { bucketKey: "sat", label: "Thu 7", netRevenue: 291800000, grossRevenue: 301600000, orderCount: 148, returnValue: 9800000 },
  { bucketKey: "sun", label: "Chu nhat", netRevenue: 264400000, grossRevenue: 273100000, orderCount: 139, returnValue: 8700000 },
]

export const dashboardMockData: DashboardMockData = {
  overview: {
    snapshotDate: "2026-03-31",
    storeId: "STORE-HCM-01",
    storeName: "Cửa hàng trung tâm",
    branchId: "BR-HCM-Q1",
    branchName: "Flagship Nguyễn Huệ",
    grossRevenue: 15623150,
    grossOrderCount: 14,
    returnValue: 2185000,
    returnOrderCount: 1,
    netRevenue: 13438150,
    netRevenueYesterday: 15193600,
    netRevenueSameDayLastMonth: 10285400,
  },
  revenueTrend: {
    daily: dailyTrend,
    hourly: hourlyTrend,
    weekday: weekdayTrend,
  },
  topProducts: [
    { productId: "PRD-AD-001", sku: "AD-ML-001", productName: "Áo dài Lụa Thượng", variantName: "Đỏ rượu - Size M", categoryName: "Áo dài nữ", quantitySold: 42, grossRevenue: 104580000, netRevenue: 98640000, returnQuantity: 1, orderCount: 27 },
    { productId: "PRD-AD-014", sku: "AD-ML-014", productName: "Áo dài Gấm Hoa Sen", variantName: "Kem vàng - Size S", categoryName: "Áo dài nữ", quantitySold: 36, grossRevenue: 83200000, netRevenue: 79600000, returnQuantity: 1, orderCount: 23 },
    { productId: "PRD-AD-022", sku: "AD-ML-022", productName: "Áo dài Cổ Tàu Thêu Tay", variantName: "Xanh ngọc - Size L", categoryName: "Áo dài thiết kế", quantitySold: 31, grossRevenue: 71450000, netRevenue: 68200000, returnQuantity: 1, orderCount: 20 },
    { productId: "PRD-QB-004", sku: "QB-ML-004", productName: "Quần Lụa Ống Suông", variantName: "Trắng kem - Size M", categoryName: "Quần áo dài", quantitySold: 54, grossRevenue: 64500000, netRevenue: 62150000, returnQuantity: 2, orderCount: 29 },
    { productId: "PRD-KN-008", sku: "KN-ML-008", productName: "Khăn đóng Ngọc Lan", variantName: "Trắng ngọc", categoryName: "Phụ kiện", quantitySold: 68, grossRevenue: 52200000, netRevenue: 50150000, returnQuantity: 3, orderCount: 34 },
    { productId: "PRD-AD-032", sku: "AD-ML-032", productName: "Áo dài Bé gái Trang Nhã", variantName: "Hồng phấn - Size 10", categoryName: "Áo dài trẻ em", quantitySold: 44, grossRevenue: 49600000, netRevenue: 48120000, returnQuantity: 2, orderCount: 24 },
    { productId: "PRD-AD-011", sku: "AD-ML-011", productName: "Áo dài Nam Taffeta", variantName: "Xanh than - Size XL", categoryName: "Áo dài nam", quantitySold: 19, grossRevenue: 46850000, netRevenue: 45240000, returnQuantity: 1, orderCount: 14 },
    { productId: "PRD-PK-002", sku: "PK-ML-002", productName: "Mấn cài Tóc Sơn Mai", variantName: "Vàng đồng", categoryName: "Phụ kiện", quantitySold: 72, grossRevenue: 43900000, netRevenue: 42680000, returnQuantity: 4, orderCount: 39 },
    { productId: "PRD-VS-006", sku: "VS-ML-006", productName: "Áo vest Cách tân", variantName: "Hồng trầm - Size M", categoryName: "Cách tân", quantitySold: 17, grossRevenue: 36500000, netRevenue: 34920000, returnQuantity: 1, orderCount: 11 },
    { productId: "PRD-GT-003", sku: "GT-ML-003", productName: "Giày Tây Lười Nam", variantName: "Đen nhám - Size 42", categoryName: "Giày dép", quantitySold: 25, grossRevenue: 25160000, netRevenue: 23780000, returnQuantity: 1, orderCount: 15 },
  ],
  topCustomers: [
    { customerId: "CUS-001", customerCode: "KH0001", fullName: "Tran Minh Tuan", segment: "VIP", location: "Ha Noi", orderCount: 9, totalItems: 27, netRevenue: 429300000, averageOrderValue: 47700000, lastOrderAt: "2026-03-30T15:20:00+07:00" },
    { customerId: "CUS-002", customerCode: "KH0014", fullName: "Nguyễn Văn Hải", segment: "VIP", location: "Hải Phòng", orderCount: 7, totalItems: 18, netRevenue: 316600000, averageOrderValue: 45228571, lastOrderAt: "2026-03-28T19:45:00+07:00" },
    { customerId: "CUS-003", customerCode: "KH0021", fullName: "Võ Anh Hoàng", segment: "Than thiet", location: "Sài Gòn", orderCount: 8, totalItems: 24, netRevenue: 241400000, averageOrderValue: 30175000, lastOrderAt: "2026-03-29T11:30:00+07:00" },
    { customerId: "CUS-004", customerCode: "KH0037", fullName: "Pham Quoc Giang", segment: "Than thiet", location: "Kim Ma", orderCount: 5, totalItems: 12, netRevenue: 119400000, averageOrderValue: 23880000, lastOrderAt: "2026-03-25T10:05:00+07:00" },
    { customerId: "CUS-005", customerCode: "KH0040", fullName: "Pham Thu Huong", segment: "Than thiet", location: "Da Nang", orderCount: 4, totalItems: 10, netRevenue: 95800000, averageOrderValue: 23950000, lastOrderAt: "2026-03-23T16:10:00+07:00" },
    { customerId: "CUS-006", customerCode: "KH0068", fullName: "Le Bao Tran", segment: "Moi", location: "Can Tho", orderCount: 3, totalItems: 7, netRevenue: 81200000, averageOrderValue: 27066667, lastOrderAt: "2026-03-27T14:40:00+07:00" },
    { customerId: "CUS-007", customerCode: "KH0072", fullName: "Doan Ngoc Anh", segment: "Moi", location: "Nha Trang", orderCount: 2, totalItems: 5, netRevenue: 65400000, averageOrderValue: 32700000, lastOrderAt: "2026-03-22T18:15:00+07:00" },
    { customerId: "CUS-008", customerCode: "KH0088", fullName: "Truong Khanh Linh", segment: "Moi", location: "Bien Hoa", orderCount: 3, totalItems: 6, netRevenue: 61200000, averageOrderValue: 20400000, lastOrderAt: "2026-03-20T13:30:00+07:00" },
    { customerId: "CUS-009", customerCode: "KH0094", fullName: "Bui Thanh Tuan", segment: "Moi", location: "Vung Tau", orderCount: 2, totalItems: 4, netRevenue: 48800000, averageOrderValue: 24400000, lastOrderAt: "2026-03-19T09:25:00+07:00" },
    { customerId: "CUS-010", customerCode: "KH0101", fullName: "Dang My Duyen", segment: "Moi", location: "Hue", orderCount: 2, totalItems: 5, netRevenue: 46300000, averageOrderValue: 23150000, lastOrderAt: "2026-03-18T20:00:00+07:00" },
  ],
  activityFeed: [
    { id: "ACT-001", occurredAt: "2026-03-31T20:15:00+07:00", relativeTimeLabel: "5 phút trước", actorId: "USR-001", actorName: "Phạm Trung Hiếu", actorRole: "Thu ngân", actionType: "sale_created", entityType: "order", entityCode: "SO-20260331-118", description: "vừa bán đơn hàng áo dài lụa cao cấp", amount: 15623150, branchName: "Flagship Nguyễn Huệ" },
    { id: "ACT-002", occurredAt: "2026-03-31T19:40:00+07:00", relativeTimeLabel: "40 phút trước", actorId: "USR-007", actorName: "Lê Thị Bảo Trân", actorRole: "Kho vận", actionType: "inventory_received", entityType: "receipt", entityCode: "GR-20260331-021", description: "vừa nhập 24 bộ áo dài sự kiện cho showroom", amount: 28400000, branchName: "Kho Tổng Thủ Đức" },
    { id: "ACT-003", occurredAt: "2026-03-31T18:25:00+07:00", relativeTimeLabel: "1 giờ trước", actorId: "USR-004", actorName: "Nguyễn Hoàng Mai", actorRole: "Chăm sóc khách hàng", actionType: "customer_created", entityType: "customer", entityCode: "KH0109", description: "vừa tạo hồ sơ khách hàng mới cho đơn đoàn sự kiện", amount: 0, branchName: "Flagship Nguyễn Huệ" },
    { id: "ACT-004", occurredAt: "2026-03-31T16:10:00+07:00", relativeTimeLabel: "4 giờ trước", actorId: "USR-001", actorName: "Phạm Trung Hiếu", actorRole: "Thu ngân", actionType: "return_created", entityType: "return", entityCode: "RT-20260331-009", description: "vừa tạo phiếu trả đồ do sai kích thước", amount: 2185000, branchName: "Flagship Nguyễn Huệ" },
    { id: "ACT-005", occurredAt: "2026-03-31T15:05:00+07:00", relativeTimeLabel: "5 giờ trước", actorId: "USR-009", actorName: "Trần Mỹ Linh", actorRole: "Tư vấn viên", actionType: "sale_created", entityType: "order", entityCode: "SO-20260331-103", description: "vừa chốt đơn áo dài cặp đôi cho khách đặt lịch chụp ảnh", amount: 46939850, branchName: "Studio Quận 3" },
    { id: "ACT-006", occurredAt: "2026-03-30T17:10:00+07:00", relativeTimeLabel: "1 ngày trước", actorId: "USR-008", actorName: "Lê Bảo Trân", actorRole: "Kho vận", actionType: "inventory_received", entityType: "receipt", entityCode: "GR-20260330-018", description: "vừa nhập phụ kiện mấn cài và khăn đóng", amount: 12300000, branchName: "Kho Tổng Thủ Đức" },
    { id: "ACT-007", occurredAt: "2026-03-30T11:30:00+07:00", relativeTimeLabel: "1 ngày trước", actorId: "USR-010", actorName: "Phạm Thu Hương", actorRole: "Quản lý chi nhánh", actionType: "sale_created", entityType: "order", entityCode: "SO-20260330-078", description: "vừa bán đơn lẻ showroom trị giá cao", amount: 48180550, branchName: "Showroom Hà Nội" },
  ],
}
