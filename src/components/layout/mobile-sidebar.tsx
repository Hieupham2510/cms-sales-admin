"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { MaiLinhLogo } from "@/components/brand/mai-linh-logo"
import { DASHBOARD_NAV } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileSidebar() {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline" size="icon" className="lg:hidden" aria-label="Mở menu" />}
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border p-4 text-left">
          <SheetTitle>
            <MaiLinhLogo compact />
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-1.5 p-3">
          {DASHBOARD_NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
