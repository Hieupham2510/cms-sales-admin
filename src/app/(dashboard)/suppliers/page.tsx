import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { suppliers } from "@/lib/mock-data"

export default function SuppliersPage() {
  return (
    <div className="section-block">
      <PageHeader
        title="Nhà cung cấp"
        description="Quản lý danh sách đối tác cung ứng."
        actionLabel="Thêm nhà cung cấp"
      />

      <Card className="app-card">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Danh sách hiện tại</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="rounded-lg border border-border bg-background p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">{supplier.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {supplier.phone} • {supplier.email}
                  </p>
                </div>
                <Badge className={supplier.status === "Tạm dừng" ? "status-badge-inactive" : "status-badge-success"}>
                  {supplier.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
