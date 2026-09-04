import { useState } from 'react'
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  CircleDashed,
  Clock,
  Copy,
  CreditCard,
  Loader2,
  RefreshCcw,
  ReceiptText,
} from 'lucide-react'
import type { Business } from '../../utils/business'
import { PLAN_PRICING, storePendingCheckout } from '../../utils/billing'
import {
  getPaymentById,
  PAYMENT_STATUS_AR,
  PAYMENT_STATUS_TONE,
  type PaymentRecord,
} from '../../utils/payments'

const DAY = 86400000

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDateTime(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function periodOf(p: PaymentRecord): { start: number; end: number } {
  const start = p.date
  const end = start + (p.cycle === 'y' ? 365 * DAY : 30 * DAY)
  return { start, end }
}

function isExpired(p: PaymentRecord): boolean {
  return Boolean(p.checkoutExpiry && p.checkoutExpiry < Date.now())
}

interface PaymentDetailPageProps {
  business: Business
  paymentId: string
  onBack: () => void
}

export function PaymentDetailPage({ business, paymentId, onBack }: PaymentDetailPageProps) {
  const [copied, setCopied] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [pay] = useState<PaymentRecord | null>(() => getPaymentById(business.id, paymentId))

  if (!pay) {
    return (
      <div className="dash-section">
        <div className="dash-section-body" style={{ textAlign: 'center', padding: 40 }}>
          <span className="dash-stat-ic danger" style={{ margin: '0 auto 14px' }}>
            <ReceiptText size={26} />
          </span>
          <p>لم يتم العثور على هذه العملية.</p>
          <button className="btn btn-secondary" type="button" onClick={onBack}>
            العودة إلى سجل المدفوعات
          </button>
        </div>
      </div>
    )
  }

  const plan = PLAN_PRICING[pay.plan]
  const period = periodOf(pay)
  const expired = isExpired(pay)
  const canResume = pay.status === 'pending' && !expired

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const handleResume = () => {
    setResuming(true)
    storePendingCheckout({ businessId: business.id, amount: pay.amount, plan: pay.plan, cycle: pay.cycle })
    window.location.hash = '#/dashboard/payment-return?status=pending'
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={onBack}
          className="team-action-btn"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 9, border: '1px solid var(--color-border-default)', background: 'var(--color-surface)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
          title="رجوع"
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          <ReceiptText size={14} style={{ verticalAlign: '-2px', marginInlineEnd: 4 }} />
          تفاصيل الدفع
        </span>
      </div>

      {/* ── Receipt card ── */}
      <div className="dash-section" style={{ maxWidth: 720 }}>
        <div className="dash-section-head">
          <span className="dash-section-title"><CreditCard /> إيصال الدفع</span>
          <span className={`pay-status pay-status-lg`} style={{ color: PAYMENT_STATUS_TONE[pay.status], background: 'var(--color-surface-muted)' }}>
            {PAYMENT_STATUS_AR[pay.status]}
          </span>
        </div>

        <div className="dash-section-body">
          <div style={{ textAlign: 'center', padding: '14px 0 4px' }}>
            <div className="pay-detail-amount">{pay.amount.toLocaleString('en-US')} <span>د.ع</span></div>
            <div className="pay-detail-amount-sub">
              {plan.name} {pay.cycle === 'y' ? 'سنوي' : 'شهري'} — {pay.gateway}
            </div>
          </div>

          <div className="billitem pay-detail-list">
            <div className="pay-detail-row">
              <span>رقم العملية</span>
              <b className="pay-detail-id">
                {pay.transactionId ?? pay.checkoutId ?? pay.id.slice(0, 12)}
                <button type="button" className="pay-detail-copy" onClick={() => handleCopy(pay.transactionId ?? pay.checkoutId ?? pay.id)} title="نسخ">
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              </b>
            </div>
            <div className="pay-detail-row">
              <span>الحالة</span>
              <b style={{ color: PAYMENT_STATUS_TONE[pay.status] }}>{PAYMENT_STATUS_AR[pay.status]}</b>
            </div>
            <div className="pay-detail-row">
              <span>البوابة</span>
              <b>{pay.gateway}</b>
            </div>
            <div className="pay-detail-row">
              <span>تاريخ الإنشاء</span>
              <b>{fmtDateTime(pay.date)}</b>
            </div>
            <div className="pay-detail-row">
              <span>تاريخ الدفع</span>
              <b>{pay.paidAt ? fmtDateTime(pay.paidAt) : '—'}</b>
            </div>
            {pay.checkoutExpiry && (
              <div className="pay-detail-row">
                <span>انتهاء صلاحية عملية الدفع</span>
                <b className={expired ? 'pay-detail-warn' : ''}>
                  {expired ? 'منتهية' : fmtDateTime(pay.checkoutExpiry)}
                </b>
              </div>
            )}
            <div className="pay-detail-row pay-detail-period">
              <span><CalendarRange size={14} /> فترة الفاتورة</span>
              <b>{fmtDate(period.start)} — {fmtDate(period.end)}</b>
            </div>
          </div>

          {canResume && (
            <div className="pay-detail-resume">
              <span className="dash-stat-ic warning" style={{ marginInlineEnd: 10 }}>
                <Clock size={20} />
              </span>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <strong>عملية دفع معلّقة</strong>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                  لم تنتهِ صلاحية عملية الدفع هذه بعد — يمكنك استئنافها وفتح بوابة ZainCash مرة أخرى بدل إنشاء عملية جديدة.
                </p>
              </div>
              <button className="btn btn-primary" type="button" disabled={resuming} onClick={handleResume}>
                {resuming ? <><Loader2 className="auth-spin" /> جارٍ التحويل...</> : <><CircleDashed size={16} /> استئناف الدفع</>}
              </button>
            </div>
          )}

          {pay.status !== 'pending' && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
              <button className="btn btn-secondary" type="button" onClick={onBack}>
                <RefreshCcw size={15} /> العودة إلى سجل المدفوعات
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PaymentDetailPage