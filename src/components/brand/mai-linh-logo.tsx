import { cn } from "@/lib/utils"

interface MaiLinhLogoProps {
  className?: string
  compact?: boolean
  storeName?: string | null
  logoUrl?: string | null
}

export function MaiLinhLogo({
  className,
  compact = false,
  storeName,
  logoUrl,
}: MaiLinhLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div
        className={cn(
          "relative overflow-hidden",
          compact ? "h-16 w-full max-w-[220px]" : "h-24 w-full max-w-[320px]"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl || "/logo.png"}
          alt={`Logo ${storeName ?? "cửa hàng"}`}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
