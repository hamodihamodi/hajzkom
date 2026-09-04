import { useState } from 'react'
import {
  BadgeCheck,
  Ban,
  CalendarCheck,
  Check,
  CreditCard,
  Crown,
  Loader2,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react'
import { toast } from '../../utils/toast'
import type { Business } from '../../utils/business'
import {
  getBilling,
  setBillingCycle,
  cancelBilling,
  resumeBilling,
  currentPeriod,
  PLAN_PRICING,
  type BillingInfo,
  type BillingCycle,
} from '../../utils/billing'
import { ConfirmDialog, StateSwitcher } from '../../components/ui/UiStates'

const CYCLE_AR: Record<BillingCycle, string> = { m: 'شهري', y: 'سنوي' }
const STATUS_AR: Record<string, string> = {
  active: 'نشط',
  past_due: 'متأخر السداد',
}

interface BillingPageProps {
  business: Business
}

export function BillingPage({ business }: BillingPageProps) {
  const [bill, setBill] = useState<BillingInfo>(() => getBilling(business.id, business.plan))
  const [loading, setLoading] = useState<null | 'cycle' | 'plan' | 'renew' | 'cancel' | 'resume'>(null)
  const [cancelModal, setCancelModal] = useState(false)
  const [demoState, setDemoState] = useState<'active' | 'past_due' | 'cancelled'>('active')

  const plan = PLAN_PRICING[bill.plan]
  const price = bill.cycle === 'y' ? plan.yearly : plan.monthly
  const isPastDue = demoState === 'past_due'
  const hasActiveCancel = demoState === 'cancelled' || bill.cancelScheduled
  const demoMode = demoState !== 'active'

  const display = () => {
    setBill(getBilling(business.id, business.plan))
  }

  const handleCycle = (cycle: BillingCycle) => {
    setLoading('cycle')
    window.setTimeout(() => {
      if (cycle === bill.cycle) {
        toast('دورة الفوترة هي نفسها الحالية.')
        setLoading(null)
        return
      }
      setBillingCycle(business.id, cycle)
      toast('تم تغيير دورة الفوترة.')
      setLoading(null)
      display()
    }, 400)
  }

  const handleCancel = () => {
    setLoading('cancel')
    window.setTimeout(() => {
      cancelBilling(business.id)
      toast('تم جدولة الإلغاء نهاية الفترة الحالية.')
      setCancelModal(false)
      setLoading(null)
      display()
    }, 400)
  }

  const handleResume = () => {
    setLoading('resume')
    window.setTimeout(() => {
      resumeBilling(business.id)
      toast('تم إلغاء طلب الإنهاء واستئناف الاشتراك.')
      setLoading(null)
      display()
    }, 400)
  }

  return (
    <>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          <CreditCard size={14} style={{ verticalAlign: '-2px', marginInlineEnd: 4 }} />
          خطتك الاشتراك والفواتير
        </span>
      </div>

      {/* ── Scenario switcher ── */}
      <div style={{ marginBottom: 16 }}>
        <StateSwitcher
          title="حالات الاشتراك"
          hint="بدّل بين حالات العرض لتجربة الحالات المشتركة (لا يغيّر الاشتراك الفعلي):"
          options={[
            { key: 'active', label: 'نشط' },
            { key: 'past_due', label: 'متأخر السداد', desc: 'past_due' },
            { key: 'cancelled', label: 'إلغاء مجدول', desc: 'cancelled' },
          ]}
          value={demoState}
          onChange={(k) => setDemoState(k as typeof demoState)}
          note={demoMode ? 'أنت تعرض وضع المحاكاة — بيانات الحالة لا تُحفظ.' : undefined}
        />
      </div>

      {/* ── Plan overview card ── */}
      <div className="dash-section" style={{ marginBottom: 18 }}>
        <div className="dash-section-head">
          <span className="dash-section-title"><Crown /> الخطة الحالية</span>
          <span className="dash-chip dash-chip-plan" title="حالة الاشتراك">
            {demoState === 'past_due' ? 'متأخر السداد' : demoState === 'cancelled' ? 'سيُنهى' : (STATUS_AR[bill.status] ?? bill.status)}
          </span>
        </div>
        <div className="dash-section-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
            <span className="dash-stat-ic primary"><Crown /></span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{plan.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{plan.description}</div>
            </div>
            <div style={{ textAlign: 'left', direction: 'ltr' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{price.toLocaleString('en-US')} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>د.ع</span></div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                {price === 0 ? 'مجاني' : CYCLE_AR[bill.cycle]}
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-subtle)', margin: '16px 0' }} />

          <div className="billgrid">
            <div className="billitem">
              <span className="billitem-label">دورة الفوترة</span>
              <span className="billitem-val">{CYCLE_AR[bill.cycle]}</span>
              <div className="bill-cycle-row">
                <button type="button" className={`bill-cycle-btn${bill.cycle === 'm' ? ' active' : ''}`} onClick={() => handleCycle('m')} disabled={loading === 'cycle'}>شهري</button>
                <button type="button" className={`bill-cycle-btn${bill.cycle === 'y' ? ' active' : ''}`} onClick={() => handleCycle('y')} disabled={loading === 'cycle'}>سنوي</button>
              </div>
            </div>
            <div className="billitem">
              <span className="billitem-label">الفترة الحالية</span>
              <span className="billitem-val"><CalendarCheck size={13} /> {currentPeriod(bill)}</span>
            </div>
            <div className="billitem">
              <span className="billitem-label">حالة الاشتراك</span>
              <span className="billitem-val" style={{ color: isPastDue ? 'var(--color-error)' : 'var(--color-success)' }}>
                {isPastDue ? 'متأخر السداد' : hasActiveCancel ? 'سيُنهى' : 'نشط'}
              </span>
            </div>
            {hasActiveCancel && (
              <div className="billitem" style={{ borderColor: 'var(--color-error-tint, var(--color-border-strong))' }}>
                <span className="billitem-label">تاريخ الإنهاء المجدول (cancelScheduledAt)</span>
                <span className="billitem-val" style={{ color: 'var(--color-error)' }}>
                  {new Date(demoState === 'cancelled' ? bill.periodEnd : bill.cancelAt).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
                  عند هذا التاريخ سيتم تخفيض خطتك إلى <b>الخطة المجانية</b>.
                </span>
              </div>
            )}
            {isPastDue && (
              <div className="billitem" style={{ borderColor: 'var(--color-warning-tint, var(--color-border-strong))' }}>
                <span className="billitem-label">موعد انتهاء فترة السماح (gracePeriodEndsAt)</span>
                <span className="billitem-val" style={{ color: 'var(--color-warning)' }}>
                  {new Date(bill.graceEnd).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
                  قم بتجديد الاشتراك قبل هذا التاريخ لتجنّب الإنهاء.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="dash-section" style={{ marginBottom: 18 }}>
        <div className="dash-section-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button className="btn btn-primary" type="button" onClick={() => { window.location.hash = '#/dashboard/changeplan' }}>
            <RefreshCcw /> تغيير الخطة
          </button>
          <button className="btn btn-primary" type="button" onClick={() => { window.location.hash = '#/dashboard/extendrenew' }}>
            <ShieldCheck /> تمديد وتجديد
          </button>
          {!hasActiveCancel ? (
            <button className="btn btn-secondary" type="button" onClick={() => setCancelModal(true)} style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
              <Ban /> إلغاء الاشتراك
            </button>
          ) : (
            <button className="btn btn-primary" type="button" onClick={handleResume} disabled={loading === 'resume'}>
              {loading === 'resume' ? <><Loader2 className="auth-spin" /> جارٍ الاستئناف...</> : <><BadgeCheck /> استئناف الاشتراك</>}
            </button>
          )}
        </div>
      </div>

      {/* ── Features ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title"><BadgeCheck /> مزايا خطتك</span>
        </div>
        <div className="dash-section-body">
          <ul className="bill-feats">
            {plan.features.map((f) => (
              <li key={f}><Check /> {f}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Cancel modal ── */}
      <ConfirmDialog
        open={cancelModal}
        title="إلغاء الاشتراك"
        tone="danger"
        confirmLabel="جدولة الإلغاء"
        cancelLabel="تراجع"
        loading={loading === 'cancel'}
        showIcon={<Ban size={16} />}
        onConfirm={handleCancel}
        onCancel={() => setCancelModal(false)}
        message={
          <p style={{ margin: 0 }}>
            سيبقى اشتراكك فعّالاً حتى نهاية الفترة الحالية (
            {new Date(bill.periodEnd).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long' })}
            )، ثم يُخفض إلى <b>الخطة المجانية</b>. يمكنك استئناف الاشتراك في أي وقت قبل ذلك.
          </p>
        }
      />
    </>
  )
}

export default BillingPage
