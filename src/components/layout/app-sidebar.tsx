"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { MaiLinhLogo } from "@/components/brand/mai-linh-logo"
import { getDashboardNavGroupsByRole } from "@/lib/constants"
import { cn } from "@/lib/utils"

type Props = {
  role: "admin" | "manager" | "staff"
  storeName?: string | null
  storeLogoUrl?: string | null
}

export function AppSidebar({ role, storeName, storeLogoUrl }: Props) {
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
    <aside className="hidden h-screen w-[272px] shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="border-b border-sidebar-border px-5 py-4">
        <MaiLinhLogo compact storeName={storeName} logoUrl={storeLogoUrl} />
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-2 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60">
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
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
    </aside>
  )
}
