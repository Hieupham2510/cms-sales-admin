import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card className="app-card">
      <CardContent className="flex min-h-44 flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-base font-semibold tracking-[-0.01em] text-foreground">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
