"use client"

import { useRouter } from "next/navigation"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenuGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/features/auth/actions/sign-out-action"

type Props = {
  fullName: string | null
  username: string
  role: "admin" | "manager" | "staff"
}

function roleLabel(role: "admin" | "manager" | "staff") {
  if (role === "admin") return "Admin"
  if (role === "manager") return "Quản lý"
  return "Nhân viên"
}

export function UserMenu({ fullName, username, role }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const initials = (fullName ?? username).slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {initials}
        </span>
        {fullName ?? username}
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {roleLabel(role)}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="size-4" />
          Cài đặt hệ thống
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/staff-home")}>
          <User className="size-4" />
          Hồ sơ cá nhân
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            startTransition(async () => {
              try {
                await signOutAction()
                router.replace("/login")
                router.refresh()
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Không thể đăng xuất")
              }
            })
          }}
          disabled={isPending}
        >
          <LogOut className="size-4" />
          {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
