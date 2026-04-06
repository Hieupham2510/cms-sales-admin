import Image from "next/image"

import { cn } from "@/lib/utils"

interface MaiLinhLogoProps {
  className?: string
  compact?: boolean
}

export function MaiLinhLogo({ className, compact = false }: MaiLinhLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div
        className={cn(
          "relative overflow-hidden",
          compact ? "h-16 w-full max-w-[220px]" : "h-24 w-full max-w-[320px]"
        )}
      >
        <Image
          src="/logo.png"
          alt="Áo Dài Liche"
          fill
          className="object-cover"
          sizes={compact ? "220px" : "320px"}
          priority
        />
      </div>
    </div>
  )
}
