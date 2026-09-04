import type { CSSProperties, ReactNode } from 'react'
import { Inbox, Loader2, RefreshCcw, SearchX, ShieldX, TriangleAlert, WifiOff } from 'lucide-react'

/* ────────────────────────────────────────────────────────────────
   Shared UI states — Empty / Loading / Error / Forbidden / Not Found
   Built on the dashboard visual language (.dash-* variables).
   ──────────────────────────────────────────────────────────────── */

export type UiTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

interface UiStateProps {
  icon?: ReactNode
  title: string
  message?: ReactNode
  tone?: UiTone
  children?: ReactNode
  style?: CSSProperties
}

export function UiState({ icon, title, message, tone = 'neutral', children, style }: UiStateProps) {
  return (
    <div className="ui-state" style={style}>
      {icon && <span className={`ui-state-ic ${tone}`}>{icon}</span>}
      <h4 className="ui-state-title">{title}</h4>
      {message && <p className="ui-state-desc">{message}</p>}
      {children && <div className="ui-state-actions">{children}</div>}
    </div>
  )
}

export function EmptyStateView({
  icon = <Inbox size={22} />,
  title,
  message,
  action,
  tone = 'neutral',
}: {
  icon?: ReactNode
  title: string
  message?: string
  action?: ReactNode
  tone?: UiTone
}) {
  return (
    <UiState icon={icon} title={title} message={message} tone={tone} style={{ padding: '36px 20px' }}>
      {action}
    </UiState>
  )
}

export function LoadingState({ label = 'جارٍ التحميل...', style }: { label?: string; style?: CSSProperties }) {
  return (
    <UiState
      icon={<Loader2 size={22} />}
      title={label}
      tone="primary"
      style={{ padding: '48px 20px', ...style }}
    />
  )
}

export function NetworkErrorState({
  message = 'تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت ثم أعد المحاولة.',
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <UiState icon={<WifiOff size={22} />} title="خطأ في الاتصال" message={message} tone="danger">
      <button className="btn btn-primary" type="button" onClick={onRetry}>
        <RefreshCcw size={15} /> إعادة المحاولة
      </button>
    </UiState>
  )
}

export function ForbiddenState({
  message = 'ليس لديك صلاحية للوصول إلى هذا القسم.',
  onBack,
  backLabel = 'العودة إلى الرئيسية',
}: {
  message?: string
  onBack?: () => void
  backLabel?: string
}) {
  return (
    <UiState icon={<ShieldX size={22} />} title="403 — ممنوع الوصول" message={message} tone="danger">
      {onBack && (
        <button className="btn btn-secondary" type="button" onClick={onBack}>
          {backLabel}
        </button>
      )}
    </UiState>
  )
}

export function NotFoundState({
  title = '404 — الصفحة غير موجودة',
  message = 'لم نتمكن من العثور على ما تبحث عنه.',
  onBack,
}: {
  title?: string
  message?: string
  onBack?: () => void
}) {
  return (
    <UiState icon={<SearchX size={22} />} title={title} message={message} tone="warning">
      {onBack && (
        <button className="btn btn-secondary" type="button" onClick={onBack}>
          <RefreshCcw size={15} /> رجوع
        </button>
      )}
    </UiState>
  )
}

export function WarningState({
  icon = <TriangleAlert size={22} />,
  title,
  message,
  action,
}: {
  icon?: ReactNode
  title: string
  message?: string
  action?: ReactNode
}) {
  return (
    <UiState icon={icon} title={title} message={message} tone="warning">
      {action}
    </UiState>
  )
}

/* ── Inline validation ─────────────────────────────────────────── */

export function FieldError({ message, style }: { message?: string; style?: CSSProperties }) {
  if (!message) return null
  return (
    <span className="ui-field-error" role="alert" style={style}>
      {message}
    </span>
  )
}

/* ── Button loading ────────────────────────────────────────────── */

interface LoadingButtonProps {
  loading?: boolean
  loadingLabel?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
  variant?: 'primary' | 'secondary' | 'danger'
  children: ReactNode
  style?: CSSProperties
}

const VARIANT_BG: Record<string, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-surface)',
  danger: 'var(--color-error)',
}

export function LoadingButton({
  loading,
  loadingLabel,
  disabled,
  onClick,
  type = 'button',
  className = 'btn',
  variant = 'primary',
  children,
  style,
}: LoadingButtonProps) {
  const base: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }
  const tone: CSSProperties =
    variant === 'secondary'
      ? { border: '1px solid var(--color-border-default)' }
      : { border: 'none', color: '#fff', background: VARIANT_BG[variant], ...(variant === 'danger' && { background: 'var(--color-error)' }) }
  return (
    <button
      className={className}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...base, ...tone, ...style }}
    >
      {loading ? (
        <>
          <Loader2 className="ui-spin" size={15} /> {loadingLabel ?? 'جارٍ...'}
        </>
      ) : (
        children
      )}
    </button>
  )
}

/* ── Plan limit / upgrade wall ─────────────────────────────────── */

export function PlanLimitNotice({
  icon,
  title,
  message,
  ctaLabel = 'ترقية الخطة',
  onUpgrade,
}: {
  icon?: ReactNode
  title: string
  message: ReactNode
  ctaLabel?: string
  onUpgrade?: () => void
}) {
  return (
    <div className="team-upgrade">
      {icon && <span className="team-upgrade-ic">{icon}</span>}
      <div style={{ flex: 1 }}>
        <h4>{title}</h4>
        <p>{message}</p>
      </div>
      {onUpgrade && (
        <button className="btn btn-primary" type="button" onClick={onUpgrade}>
          {ctaLabel}
        </button>
      )}
    </div>
  )
}

/* ── Confirm dialog (destructive or regular) ───────────────────── */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  tone = 'primary',
  loading = false,
  showIcon,
  onConfirm,
  onCancel,
  maxWidth = 430,
}: {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  loading?: boolean
  showIcon?: ReactNode
  onConfirm: () => void
  onCancel: () => void
  maxWidth?: number
}) {
  if (!open) return null
  const danger = tone === 'danger'
  return (
    <div className="dash-overlay open" onClick={onCancel}>
      <div
        className="dash-section"
        style={{ position: 'relative', width: '100%', maxWidth, margin: '12vh auto', cursor: 'default' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dash-section-head" style={danger ? { borderBottomColor: 'var(--color-error-background)' } : undefined}>
          <span className="dash-section-title" style={danger ? { color: 'var(--color-error)' } : undefined}>
            {showIcon} {title}
          </span>
          <button className="dash-section-action" type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontWeight: 700 }}>
            ✕
          </button>
        </div>
        <div style={{ padding: 24 }}>
          <p className="ui-confirm-msg">{message}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <LoadingButton loading={loading} variant={danger ? 'danger' : 'primary'} onClick={onConfirm} style={{ flex: 1 }}>
              {confirmLabel}
            </LoadingButton>
            <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={loading} style={{ padding: '10px 20px', borderRadius: 10, fontFamily: 'inherit' }}>
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Demo state switcher (replaces the static per-screen switcher) ── */

export interface SwitchOption {
  key: string
  label: string
  desc?: string
}

export function StateSwitcher({
  title = 'حالات العرض',
  hint,
  options,
  value,
  onChange,
  note,
}: {
  title?: string
  hint?: string
  options: SwitchOption[]
  value: string
  onChange: (key: string) => void
  note?: ReactNode
}) {
  return (
    <div className="dash-section" style={{ position: 'relative' }}>
      <div className="dash-section-head">
        <span className="dash-section-title">{title}</span>
      </div>
      <div className="dash-section-body">
        {hint && <p className="ui-switch-hint">{hint}</p>}
        <div className="ui-switch-list">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`ui-switch-btn${value === opt.key ? ' active' : ''}`}
              onClick={() => onChange(opt.key)}
            >
              <span className="ui-switch-label">{opt.label}</span>
              {opt.desc && <span className="ui-switch-desc">{opt.desc}</span>}
            </button>
          ))}
        </div>
        {note && <p className="ui-switch-note">{note}</p>}
      </div>
    </div>
  )
}

export default UiState