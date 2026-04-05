import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const summary = [
  { label: "Tổng SKU", value: "74", tone: "text-foreground" },
  { label: "Sắp hết hàng", value: "12", tone: "text-[hsl(var(--low-stock))]" },
  { label: "Đang nhập chờ duyệt", value: "6", tone: "text-primary" },
]

export function StockSummary() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {summary.map((item) => (
        <Card key={item.label} className="metric-card">
          <CardHeader className="pb-2">
            <CardTitle className="metric-label">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`metric-value ${item.tone}`}>{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
