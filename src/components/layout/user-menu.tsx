"use client"

import { useRouter } from "next/navigation"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          AD
        </span>
        Admin
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="size-4" />
          Cài đặt hệ thống
        </DropdownMenuItem>
        <DropdownMenuItem>
          <User className="size-4" />
          Hồ sơ cá nhân
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <LogOut className="size-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
