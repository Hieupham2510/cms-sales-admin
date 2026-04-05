import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"

export function ExampleToolbarActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Export Excel
      </Button>

      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Thêm hàng hóa
      </Button>
    </div>
  )
}