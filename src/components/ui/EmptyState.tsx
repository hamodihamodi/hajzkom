import type { ComponentType, ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: ReactNode
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-surface-muted px-6 py-10 text-center">
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-surface">
          <Icon className="size-5 text-text-tertiary" />
        </div>
      )}
      <h3 className="mt-4 text-sm font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm leading-relaxed text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default EmptyState
