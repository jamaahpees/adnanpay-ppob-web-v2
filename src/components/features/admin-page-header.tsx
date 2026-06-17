import { cn } from '@/lib/utils'

interface AdminPageHeaderProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  actions?: React.ReactNode
  className?: string
}

// Shared page header for admin screens. Keeps the title/action rhythm consistent
// across Dashboard, Produk, Pricing, and Transaksi without restyling each page.
export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          <h1
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-jakarta), ui-sans-serif, system-ui' }}
          >
            {title}
          </h1>
        </div>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
