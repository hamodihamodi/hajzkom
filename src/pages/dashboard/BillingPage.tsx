import { useState } from 'react'
import {
  BadgeCheck,
  Ban,
  CalendarCheck,
  Check,
  ChevronLeft,
  CreditCard,
  Crown,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  X,
} from 'lucide-react'
import { toast } from '../../utils/toast'
import type { Business, PlanTier } from '../../utils/business'
import { getBusinessById } from '../../utils/business'
import {
  getBilling,
  setBillingCycle,
  setBillingPlan,
  renewBilling,
  cancelBilling,
  resumeBilling,
  currentPeriod,
  PLAN_PRICING,
  type BillingInfo,
  type BillingCycle,
} from '../../utils/billing'

const CYCLE_AR: Record<BillingCycle, string> = { m: 'شهري', y: 'سنوي' }
const STATUS_AR: Record<string, string> = {
  active: 'نشط',
  past_due: 'متأخر السداد',
}

const ORDER: PlanTier[] = ['free', 'pro', 'max']

interface BillingPageProps {
  business: Business
  onRefresh: () => void
}

export function BillingPage({ business, onRefresh }: BillingPageProps) {
  const [bill, setBill] = useState<BillingInfo>(() => getBilling(business.id, business.plan))
  const [loading, setLoading] = useState<null | 'cycle' | 'plan' | 'renew' | 'cancel' | 'resume'>(null)
  const [planModal, setPlanModal] = useState(false)
  const [cancelModal, setCancelModal] = useState(false)
  const [upcoming, setUpcoming] = useState<PlanTier | null>(null)

  const plan = PLAN_PRICING[bill.plan]
  const price = bill.cycle === 'y' ? plan.yearly : plan.monthly
  const hasActiveCancel = bill.cancelScheduled
  const isPastDue = bill.status === 'past_due'

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

  const confirmPlan = () => {
    if (!upcoming) return
    setLoading('plan')
    window.setTimeout(() => {
      setBillingPlan(business.id, upcoming)
      const updated = getBusinessById(business.id)
      if (updated) onRefresh()
      toast('تم تغيير الخطة.')
      setUpcoming(null)
      setLoading(null)
      display()
    }, 400)
  }

  const handleRenew = () => {
    setLoading('renew')
    window.setTimeout(() => {
      renewBilling(business.id)
      toast('تم تمديد الاشتراك وتجديد الفترة.')
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

  const confirmButton = upcoming ? renderConfirmPlan() : null

  return (
    <>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          <CreditCard size={14} style={{ verticalAlign: '-2px', marginInlineEnd: 4 }} />
          خطتك الاشتراك والفواتير
        </span>
      </div>

      {/* ── Plan overview card ── */}
      <div className="dash-section" style={{ marginBottom: 18 }}>
        <div className="dash-section-head">
          <span className="dash-section-title"><Crown /> الخطة الحالية</span>
          <span className="dash-chip dash-chip-plan" title="حالة الاشتراك">
            {STATUS_AR[bill.status] ?? bill.status}
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
              <div className="billitem">
                <span className="billitem-label">تاريخ الإنهاء المحدد</span>
                <span className="billitem-val">
                  {new Date(bill.cancelAt).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {isPastDue && (
              <div className="billitem">
                <span className="billitem-label">فترة السماح (سن الرجوع)</span>
                <span className="billitem-val" style={{ color: 'var(--color-warning)' }}>
                  {new Date(bill.graceEnd).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="dash-section" style={{ marginBottom: 18 }}>
        <div className="dash-section-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button className="btn btn-primary" type="button" onClick={() => { setUpcoming(null); setPlanModal(true) }}>
            <RefreshCcw /> تغيير الخطة
          </button>
          {isPastDue ? (
            <button className="btn btn-primary" type="button" onClick={handleRenew} disabled={loading === 'renew'}>
              {loading === 'renew' ? <><Loader2 className="auth-spin" /> جارٍ التجديد...</> : <><ShieldCheck /> تمديد وتجديد</>}
            </button>
          ) : !hasActiveCancel ? (
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

      {/* ── Plan change modal ── */}
      {planModal && (
        <div className="dash-overlay open" onClick={() => { setPlanModal(false); setUpcoming(null) }}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 560, margin: '6vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Crown /> تغيير الخطة</span>
              <button className="dash-section-action" type="button" onClick={() => setPlanModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 16 }}>
              {ORDER.map((key) => {
                const p = PLAN_PRICING[key]
                const isCurrent = key === bill.plan
                return (
                  <button
                    key={key}
                    type="button"
                    className={`bill-plan-row${isCurrent ? ' current' : ''}`}
                    onClick={() => { setUpcoming(key); setPlanModal(false) }}
                  >
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{p.description}</div>
                    </div>
                    <div style={{ textAlign: 'left', direction: 'ltr', fontSize: '0.9rem', fontWeight: 700 }}>
                      {p.monthly === 0 ? 'مجاني' : `${p.monthly.toLocaleString('en-US')} /شهرياً`}
                    </div>
                    {isCurrent && <ChevronLeft size={16} style={{ color: 'var(--color-text-tertiary)' }} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm plan change ── */}
      {upcoming && (
        <div className="dash-overlay open" onClick={() => setUpcoming(null)}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '12vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Crown /> تأكيد تغيير الخطة</span>
              <button className="dash-section-action" type="button" onClick={() => setUpcoming(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.8, margin: '0 0 20px' }}>
                ستنتقل إلى خطة <b style={{ color: 'var(--color-text-primary)' }}>{PLAN_PRICING[upcoming].name}</b> وسيبدأ احتساب الفترة من اليوم.
              </p>
              {confirmButton}
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel modal ── */}
      {cancelModal && (
        <div className="dash-overlay open" onClick={() => setCancelModal(false)}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '12vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Ban /> إلغاء الاشتراك</span>
              <button className="dash-section-action" type="button" onClick={() => setCancelModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.8, margin: '0 0 20px' }}>
                سيبقى اشتراكك فعّالاً حتى نهاية الفترة الحالية
                ({new Date(bill.periodEnd).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long' })}),
                ثم يُخفض إلى الخطة المجانية. يمكنك استئناف الاشتراك في أي وقت قبل ذلك.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="button" disabled={loading === 'cancel'} style={{ ...primaryBtnS, background: 'var(--color-error)' }} onClick={handleCancel}>
                  {loading === 'cancel' ? <><Loader2 className="auth-spin" /> جارٍ الإلغاء...</> : <><Ban /> جدولة الإلغاء</>}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setCancelModal(false)} disabled={loading === 'cancel'} style={secondaryBtnS}>تراجع</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )

  function renderConfirmPlan() {
    if (!upcoming) return null
    return (
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" type="button" disabled={loading === 'plan'} onClick={confirmPlan} style={primaryBtnS}>
          {loading === 'plan' ? <><Loader2 className="auth-spin" /> جارٍ الحفظ...</> : <><Check /> تأكيد</>}
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => setUpcoming(null)} disabled={loading === 'plan'} style={secondaryBtnS}>تراجع</button>
      </div>
    )
  }
}

const primaryBtnS: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const secondaryBtnS: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border-default)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--color-surface)' }

export default BillingPage
