import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InventoryExportsPage() {
  return (
    <div className="section-block">
      <PageHeader title="Xuất kho" description="Kiểm soát các phiếu xuất cho đơn bán." actionLabel="Tạo phiếu xuất" />
      <Card className="app-card">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Danh sách phiếu xuất</CardTitle>
        </CardHeader>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Khu vực này dùng để tích hợp luồng duyệt xuất kho.
        </CardContent>
      </Card>
    </div>
  )
}
