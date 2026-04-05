type AppCardProps = {
    title?: string
    description?: string
    children: React.ReactNode
  }
  
  export function AppCard({ title, description, children }: AppCardProps) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        {(title || description) && (
          <div className="border-b px-5 py-4">
            {title ? (
              <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    )
  }