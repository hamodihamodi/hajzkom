import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  Clock,
  Loader2,
  RefreshCcw,
  SlidersHorizontal,
  Timer,
  XCircle,
} from 'lucide-react'
import type { Business } from '../../utils/business'
import {
  getBilling,
  getPendingCheckout,
  clearPendingCheckout,
  PLAN_PRICING,
} from '../../utils/billing'

type PaymentStatus = 'success' | 'failed' | 'expired' | 'pending'

const STATUS_OPTIONS: Array<{ key: PaymentStatus; label: string; desc: string }> = [
  { key: 'success', label: 'نجح الدفع', desc: 'status = success' },
  { key: 'failed', label: 'فشل الدفع', desc: 'status = failed' },
  { key: 'expired', label: 'انتهت المهلة', desc: 'status = expired' },
  { key: 'pending', label: 'قيد الانتظار', desc: 'status = pending' },
]

function readStatus(): PaymentStatus {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const match = hash.match(/[?&]status=([^&]+)/)
  const raw = match ? match[1] : ''
  if (['success', 'failed', 'expired', 'pending'].includes(raw)) return raw as PaymentStatus
  return 'success'
}

interface PaymentReturnPageProps {
  business: Business
  onBack: () => void
}

interface StateShape {
  tone: string
  icon: React.ReactNode
  title: string
  message: string
  detail?: Array<{ label: string; value: string }>
  primaryAction: () => React.ReactNode
  secondaryAction?: () => React.ReactNode
}

export function PaymentReturnPage({ business, onBack }: PaymentReturnPageProps) {
  const [status, setStatus] = useState<PaymentStatus>(readStatus)
  const [refreshing, setRefreshing] = useState(false)
  const pending = getPendingCheckout(business.id)
  const bill = getBilling(business.id, business.plan)
  const plan = PLAN_PRICING[bill.plan]

  const handleRefresh = () => {
    setRefreshing(true)
    window.setTimeout(() => {
      setRefreshing(false)
    }, 900)
  }

  const goBack = () => {
    onBack()
  }

  const switchStatus = (next: PaymentStatus) => {
    window.location.hash = `#/dashboard/payment-return?status=${next}`
    setStatus(next)
  }

  const content = buildState()

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={goBack}
          className="team-action-btn"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 9, border: '1px solid var(--color-border-default)', background: 'var(--color-surface)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
          title="رجوع"
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>العودة إلى صفحة الاشتراك</span>
      </div>

      <div className="pay-return-grid">
        {/* ── Main content (right) ── */}
        <div className="dash-section">
          <div className="dash-section-body" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <span className={`dash-stat-ic lg ${content.tone}`} style={{ margin: '0 auto 16px' }}>
              {content.icon}
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px' }}>
              {content.title}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: 440, margin: '0 auto 22px' }}>
              {content.message}
            </p>

            {content.detail && (
              <div className="billitem" style={{ maxWidth: 360, margin: '0 auto 22px', textAlign: 'right' }}>
                {content.detail.map((d) => (
                  <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '4px 0' }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>{d.label}</span>
                    <span style={{ fontWeight: 700 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {content.primaryAction()}
              {content.secondaryAction?.()}
            </div>
          </div>
        </div>

        {/* ── Gateway state switcher (left) ── */}
        <div className="dash-section pay-return-switch">
          <div className="dash-section-head">
            <span className="dash-section-title"><SlidersHorizontal /> حالات الرجوع من البوابة</span>
          </div>
          <div className="dash-section-body">
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', lineHeight: 1.7, margin: '0 0 14px' }}>
              محاكاة لاستجابة بوابة ZainCash بعد تحويل الدفع:
            </p>
            <div className="pay-switch-list">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`pay-switch-btn${status === opt.key ? ' active' : ''}`}
                  onClick={() => switchStatus(opt.key)}
                >
                  <span className="pay-switch-label">{opt.label}</span>
                  <span className="pay-switch-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
            {pending && status !== 'failed' && status !== 'success' && (
              <p style={{ fontSize: '0.74rem', color: 'var(--color-warning)', lineHeight: 1.6, margin: '14px 0 0' }}>
                توجد عملية دفع معلّقة سارية — يمكن استئنافها بدل إنشاء عملية جديدة.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )

  function buildState(): StateShape {
    const base = (tone: string, icon: React.ReactNode, title: string, message: string, detail?: Array<{ label: string; value: string }>): Omit<StateShape, 'primaryAction' | 'secondaryAction'> => ({
      tone,
      icon,
      title,
      message,
      detail,
    })

    switch (status) {
      case 'success':
        clearPendingCheckout()
        return {
          ...base(
            'primary',
            <CheckCircle2 size={30} />,
            'نجح الدفع',
            'تم تأكيد دفعتك عبر ZainCash بنجاح. خطتك الآن محدّثة.',
            [
              { label: 'الخطة الحالية', value: plan.name },
              { label: 'الفترة', value: `${formatDate(bill.periodStart)} — ${formatDate(bill.periodEnd)}` },
            ],
          ),
          primaryAction: () => (
            <button className="btn btn-primary" type="button" style={primaryBtnS} onClick={contentDone}>
              الذهاب إلى صفحة الخطة
            </button>
          ),
        }
      case 'failed':
        return {
          ...base(
            'danger',
            <XCircle size={30} />,
            'فشل الدفع',
            'تعذّر إتمام الدفع عبر ZainCash. لا تقلق — لم يتم خصم أي مبلغ. حاول مرة أخرى.',
          ),
          primaryAction: () => (
            <button className="btn btn-primary" type="button" style={primaryBtnS} onClick={() => { window.location.hash = '#/dashboard/extendrenew' }}>
              <RefreshCcw /> إعادة المحاولة
            </button>
          ),
          secondaryAction: () => (
            <button className="btn btn-secondary" type="button" style={secondaryBtnS} onClick={goBack}>
              العودة
            </button>
          ),
        }
      case 'expired':
        return {
          ...base(
            'warning',
            <Timer size={30} />,
            'انتهت مهلة الدفع',
            'انتهت صلاحية عملية الدفع هذه وانتهت مدتها. يمكنك بدء عملية دفع جديدة في أي وقت.',
          ),
          primaryAction: () => (
            <button className="btn btn-primary" type="button" style={primaryBtnS} onClick={() => { window.location.hash = '#/dashboard/extendrenew' }}>
              بدء عملية دفع جديدة
            </button>
          ),
          secondaryAction: () => (
            <button className="btn btn-secondary" type="button" style={secondaryBtnS} onClick={goBack}>
              العودة
            </button>
          ),
        }
      case 'pending':
      default:
        return {
          ...base(
            'warning',
            <Clock size={30} />,
            'بانتظار تأكيد الدفع',
            'لم نتلقَّ تأكيد الدفع من ZainCash بعد. يرجى الانتظار قليلاً والتحقق من إشعار تطبيق ZainCash، ثم حدّث الصفحة.',
          ),
          primaryAction: () => (
            <button className="btn btn-primary" type="button" style={primaryBtnS} disabled={refreshing} onClick={handleRefresh}>
              {refreshing ? <><Loader2 className="auth-spin" /> جارٍ التحديث...</> : <><RefreshCcw /> تحديث</>}
            </button>
          ),
          secondaryAction: () =>
            pending ? (
              <button className="btn btn-secondary" type="button" style={secondaryBtnS} onClick={goBack}>
                <CircleDashed /> استئناف الدفع
              </button>
            ) : undefined,
        }
    }
  }

  function contentDone() {
    window.location.hash = '#/dashboard/billing'
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })
}

const primaryBtnS: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 24px', borderRadius: 10, border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const secondaryBtnS: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border-default)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--color-surface)' }

export default PaymentReturnPage
