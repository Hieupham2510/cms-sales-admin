import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Plus } from "lucide-react"

export function ProductTableToolbar() {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full max-w-md items-center gap-2">
        <Input placeholder="Tìm theo tên, SKU, barcode..." />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm hàng hóa
        </Button>
      </div>
    </div>
  )
}