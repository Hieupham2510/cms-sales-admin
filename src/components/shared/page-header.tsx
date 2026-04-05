import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description: string
  actionLabel?: string
  className?: string
}

export function PageHeader({ title, description, actionLabel, className }: PageHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className ?? ""}`}>
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {actionLabel ? <Button>{actionLabel}</Button> : null}
    </div>
  )
}
