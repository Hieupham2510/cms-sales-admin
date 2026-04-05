import { Bell, Search } from "lucide-react"

import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:px-6">
      <div className="flex min-h-14 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <MobileSidebar />
          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Thông báo">
            <Bell className="size-4" />
          </Button>
          <UserMenu />
        </div>
      </div>

      <div className="relative mt-3 w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Tìm sản phẩm, mã SKU..." className="pl-9" />
      </div>
    </header>
  )
}
