import { useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Crown,
  Loader2,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react'
import type { Business, PlanTier } from '../../utils/business'
import { getBusinessById } from '../../utils/business'
import {
  getBilling,
  setBillingCycle,
  setBillingPlan,
  PLAN_PRICING,
  type BillingInfo,
  type BillingCycle,
} from '../../utils/billing'

const CYCLE_AR: Record<BillingCycle, string> = { m: 'شهري', y: 'سنوي' }
const ORDER: PlanTier[] = ['free', 'pro', 'max']

interface ChangePlanPageProps {
  business: Business
  onBack: () => void
}

export function ChangePlanPage({ business, onBack }: ChangePlanPageProps) {
  const [bill] = useState<BillingInfo>(() => getBilling(business.id, business.plan))
  const [selected, setSelected] = useState<PlanTier>(business.plan)
  const [cycle, setCycle] = useState<BillingCycle>(bill.cycle)
  const [step, setStep] = useState<'select' | 'done'>('select')
  const [checkout, setCheckout] = useState(false)
  const [loading, setLoading] = useState(false)

  const sel = PLAN_PRICING[selected]
  const selPrice = cycle === 'y' ? sel.yearly : sel.monthly
  const isPaid = selected !== 'free'

  const chooseCycle = (c: BillingCycle) => {
    setCycle(c)
    setBillingCycle(business.id, c)
  }

  const primary = () => {
    setLoading(true)
    window.setTimeout(() => {
      setBillingPlan(business.id, selected)
      const updated = getBusinessById(business.id)
      if (updated) {
        window.dispatchEvent(new Event('storage'))
      }
      setLoading(false)
      setStep('done')
    }, 600)
  }

  const cancelFlow = () => {
    setLoading(true)
    window.setTimeout(() => {
      setBillingPlan(business.id, 'free')
      setLoading(false)
      setStep('done')
    }, 600)
  }

  return (
    <>
      {/* ── Header ── */}
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
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>تغيير الخطة</span>
      </div>

      {step === 'done' ? (
        <div className="dash-section">
          <div className="dash-section-head">
            <span className="dash-section-title"><BadgeCheck /> تم تحديث خطتك</span>
          </div>
          <div className="dash-section-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <span className="dash-stat-ic primary" style={{ margin: '0 auto 14px' }}><Crown /></span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px' }}>
              أصبحت خطتك الحالية: {sel.name}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.7 }}>
              {isPaid
                ? `تم تطبيق خطة ${sel.name} بدورة ${CYCLE_AR[cycle]} (${selPrice.toLocaleString('en-US')} د.ع).`
                : 'تم التحويل إلى الخطة المجانية.'}
            </p>
            <button className="btn btn-primary" type="button" onClick={onBack} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              العودة إلى صفحة الاشتراك
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Cycle toggle ── */}
          <div className="dash-section" style={{ marginBottom: 18 }}>
            <div className="dash-section-body" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>دورة الفوترة:</span>
              <div className="bill-cycle-row">
                <button type="button" className={`bill-cycle-btn${cycle === 'm' ? ' active' : ''}`} onClick={() => chooseCycle('m')}>شهري</button>
                <button type="button" className={`bill-cycle-btn${cycle === 'y' ? ' active' : ''}`} onClick={() => chooseCycle('y')}>سنوي</button>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>الدفع السنوي وفّر قيمة شهرين</span>
            </div>
          </div>

          {/* ── Plans ── */}
          <div className="bill-change-grid">
            {ORDER.map((key) => {
              const p = PLAN_PRICING[key]
              const price = cycle === 'y' ? p.yearly : p.monthly
              const active = selected === key
              return (
                <button
                  key={key}
                  type="button"
                  className={`bill-change-card${active ? ' active' : ''}${key === 'pro' ? ' pro' : ''}`}
                  onClick={() => setSelected(key)}
                >
                  <span className="bill-change-name">{p.name}</span>
                  <p className="bill-change-desc">{p.description}</p>
                  <div className="bill-change-price">
                    <b>{price.toLocaleString('en-US')}</b>
                    <span> د.ع / {CYCLE_AR[cycle]}</span>
                  </div>
                  {price === 0 && <span className="bill-change-free">مجاني</span>}
                  <ul className="bill-change-feats">
                    {p.features.map((f) => (
                      <li key={f}><Check /> {f}</li>
                    ))}
                  </ul>
                  <span className="bill-change-radio">
                    {active && <Check size={14} />}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ── Payment method info ── */}
          <div className="dash-section" style={{ marginTop: 18 }}>
            <div className="dash-section-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="dash-stat-ic primary"><Wallet /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>طريقة الدفع</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>ZainCash — الدفع الإلكتروني حصراً لهذه العملية</div>
              </div>
              <span className="dash-chip"><Smartphone size={13} /> ZainCash</span>
            </div>
          </div>

          {/* ── Primary action ── */}
          <div className="dash-section" style={{ marginTop: 18 }}>
            <div className="dash-section-body">
              {isPaid ? (
                <button className="btn btn-primary" type="button" style={primaryBtnS} disabled={loading} onClick={() => setCheckout(true)}>
                  <Wallet /> المتابعة إلى ZainCash
                </button>
              ) : (
                <button className="btn btn-primary" type="button" style={primaryBtnS} disabled={loading} onClick={cancelFlow}>
                  {loading ? <><Loader2 className="auth-spin" /> جارٍ التحويل...</> : <><ShieldCheck /> التحويل إلى الخطة المجانية</>}
                </button>
              )}
            </div>
          </div>

          {/* ── Checkout modal ── */}
          {checkout && isPaid && (
            <CheckoutModal
              planName={sel.name}
              cycle={CYCLE_AR[cycle]}
              price={selPrice}
              onConfirm={primary}
              onClose={() => setCheckout(false)}
              loading={loading}
            />
          )}
        </>
      )}
    </>
  )
}

function CheckoutModal({
  planName,
  cycle,
  price,
  onConfirm,
  onClose,
  loading,
}: {
  planName: string
  cycle: string
  price: number
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  return (
    <div className="dash-overlay open" onClick={onClose}>
      <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 460, margin: '10vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
        <div className="dash-section-head">
          <span className="dash-section-title"><Wallet /> الدفع عبر ZainCash</span>
          <button className="dash-section-action" type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
        </div>
        <div style={{ padding: 24 }}>
          <div className="billitem" style={{ marginBottom: 14 }}>
            <span className="billitem-label">الخطة</span>
            <span className="billitem-val">{planName}</span>
          </div>
          <div className="billitem" style={{ marginBottom: 14 }}>
            <span className="billitem-label">دورة الفوترة</span>
            <span className="billitem-val">{cycle}</span>
          </div>
          <div className="billitem" style={{ marginBottom: 20 }}>
            <span className="billitem-label">المبلغ</span>
            <span className="billitem-val" style={{ color: 'var(--color-primary)', fontSize: '1.15rem' }}>
              {price.toLocaleString('en-US')} د.ع
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', lineHeight: 1.7, margin: '0 0 20px' }}>
            سيتم توجيهك إلى ZainCash لإتمام الدفع. أدخل رقم هاتف ZainCash الخاص بك عند التحويل.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="button" disabled={loading} style={primaryBtnS} onClick={onConfirm}>
              {loading ? <><Loader2 className="auth-spin" /> جارٍ التأكيد...</> : <><Smartphone /> تأكيد عبر ZainCash</>}
            </button>
            <button className="btn btn-secondary" type="button" onClick={onClose} disabled={loading} style={secondaryBtnS}>تراجع</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const primaryBtnS: React.CSSProperties = { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const secondaryBtnS: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border-default)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--color-surface)' }

export default ChangePlanPage
