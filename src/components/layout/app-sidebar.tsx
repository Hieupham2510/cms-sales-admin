"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { MaiLinhLogo } from "@/components/brand/mai-linh-logo"
import { DASHBOARD_NAV } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-screen w-[272px] shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="border-b border-sidebar-border px-5 py-4">
        <MaiLinhLogo compact />
      </div>

      <nav className="flex-1 space-y-1.5 p-3">
        {DASHBOARD_NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
