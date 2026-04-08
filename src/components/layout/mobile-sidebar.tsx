"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { MaiLinhLogo } from "@/components/brand/mai-linh-logo"
import { getDashboardNavGroupsByRole } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type Props = {
  role: "admin" | "manager" | "staff"
  storeName?: string | null
  storeLogoUrl?: string | null
}

export function MobileSidebar({ role, storeName, storeLogoUrl }: Props) {
  const pathname = usePathname()
  const navGroups = getDashboardNavGroupsByRole(role)
  const navItems = navGroups.flatMap((group) => group.items)
  const activeHref =
    navItems
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find(
        (item) =>
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
      )?.href ?? ""

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
            <MaiLinhLogo compact storeName={storeName} logoUrl={storeLogoUrl} />
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-4 p-3">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = activeHref === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className={cn(
                      "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
