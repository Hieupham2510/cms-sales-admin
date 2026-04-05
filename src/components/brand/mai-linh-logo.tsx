import { cn } from "@/lib/utils"

interface MaiLinhLogoProps {
  className?: string
  compact?: boolean
}

export function MaiLinhLogo({ className, compact = false }: MaiLinhLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
        <svg
          viewBox="0 0 48 48"
          aria-hidden="true"
          className="h-7 w-7 text-primary"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 8C18.4 8 14 12.4 14 18V40H19V28.6C19 25.7 21.3 23.4 24.2 23.4C27 23.4 29.4 25.7 29.4 28.6V40H34V18C34 12.4 29.6 8 24 8Z"
            fill="currentColor"
            fillOpacity="0.14"
          />
          <path
            d="M24 8C18.4 8 14 12.4 14 18V40H19V28.6C19 25.7 21.3 23.4 24.2 23.4C27 23.4 29.4 25.7 29.4 28.6V40H34V18C34 12.4 29.6 8 24 8Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 18.2C19 15.1 21.3 12.6 24.2 12.6C27 12.6 29.4 15.1 29.4 18.2"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M18.3 40H29.8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="min-w-0">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Thương hiệu
        </p>
        <p className="truncate text-base font-semibold tracking-[-0.01em] text-foreground">
          Áo dài Mai Linh
        </p>
        {!compact ? <p className="text-xs text-muted-foreground">Sales admin dashboard</p> : null}
      </div>
    </div>
  )
}
