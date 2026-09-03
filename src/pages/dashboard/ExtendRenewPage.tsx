import { useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  Crown,
  Loader2,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react'
import type { Business } from '../../utils/business'
import {
  getBilling,
  renewBilling,
  PLAN_PRICING,
  type BillingInfo,
  type BillingCycle,
} from '../../utils/billing'

const CYCLE_AR: Record<BillingCycle, string> = { m: 'شهري', y: 'سنوي' }
const DAY = 86400000

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface ExtendRenewPageProps {
  business: Business
  onBack: () => void
}

export function ExtendRenewPage({ business, onBack }: ExtendRenewPageProps) {
  const [bill] = useState<BillingInfo>(() => getBilling(business.id, business.plan))
  const [cycle, setCycle] = useState<BillingCycle>(bill.cycle)
  const [checkout, setCheckout] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const plan = PLAN_PRICING[bill.plan]
  const price = cycle === 'y' ? plan.yearly : plan.monthly
  const cycleMs = cycle === 'y' ? 365 * DAY : 30 * DAY
  const newStart = Math.max(Date.now(), bill.periodEnd)
  const newEnd = newStart + cycleMs

  const applyRenew = () => {
    setLoading(true)
    window.setTimeout(() => {
      renewBilling(business.id)
      setLoading(false)
      setCheckout(false)
      setDone(true)
    }, 700)
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
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>تمديد / تجديد الاشتراك</span>
      </div>

      {done ? (
        <div className="dash-section">
          <div className="dash-section-head">
            <span className="dash-section-title"><BadgeCheck /> تم التجديد</span>
          </div>
          <div className="dash-section-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <span className="dash-stat-ic primary" style={{ margin: '0 auto 14px' }}><Crown /></span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px' }}>
              تم تجديد اشتراكك بنجاح
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.7 }}>
              خطتك ({plan.name}) محدّثة حتى <b>{formatDate(newEnd)}</b>.
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
              <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>مدة التجديد:</span>
              <div className="bill-cycle-row">
                <button type="button" className={`bill-cycle-btn${cycle === 'm' ? ' active' : ''}`} onClick={() => setCycle('m')}>شهري</button>
                <button type="button" className={`bill-cycle-btn${cycle === 'y' ? ' active' : ''}`} onClick={() => setCycle('y')}>سنوي</button>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>التجديد السنوي وفّر قيمة شهرين</span>
            </div>
          </div>

          {/* ── Detail card ── */}
          <div className="dash-section">
            <div className="dash-section-head">
              <span className="dash-section-title"><Crown /> تفاصيل التجديد</span>
            </div>
            <div className="dash-section-body">
              <div className="billgrid">
                <div className="billitem">
                  <span className="billitem-label">الخطة الحالية</span>
                  <span className="billitem-val"><Crown size={13} /> {plan.name}</span>
                </div>
                <div className="billitem">
                  <span className="billitem-label">مبلغ الدفع</span>
                  <span className="billitem-val" style={{ color: 'var(--color-primary)', fontSize: '1.05rem' }}>{price.toLocaleString('en-US')} د.ع</span>
                </div>
                <div className="billitem">
                  <span className="billitem-label">دورة التجديد</span>
                  <span className="billitem-val">{CYCLE_AR[cycle]}</span>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-subtle)', margin: '16px 0' }} />

              <div className="billgrid">
                <div className="billitem">
                  <span className="billitem-label">الفترة الحالية</span>
                  <span className="billitem-val"><CalendarCheck size={13} /> {formatDate(bill.periodStart)} — {formatDate(bill.periodEnd)}</span>
                </div>
                <div className="billitem" style={{ borderColor: 'var(--color-primary-tint)', background: 'var(--color-primary-subtle)' }}>
                  <span className="billitem-label">الفترة الجديدة</span>
                  <span className="billitem-val"><CalendarCheck size={13} /> {formatDate(newStart)} — {formatDate(newEnd)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Payment method ── */}
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
              <button className="btn btn-primary" type="button" style={primaryBtnS} disabled={loading} onClick={() => setCheckout(true)}>
                <Wallet /> المتابعة إلى ZainCash
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Checkout modal ── */}
      {checkout && (
        <div className="dash-overlay open" onClick={() => setCheckout(false)}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 460, margin: '10vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Wallet /> الدفع عبر ZainCash</span>
              <button className="dash-section-action" type="button" onClick={() => setCheckout(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div className="billitem" style={{ marginBottom: 14 }}>
                <span className="billitem-label">الخطة</span>
                <span className="billitem-val">{plan.name}</span>
              </div>
              <div className="billitem" style={{ marginBottom: 14 }}>
                <span className="billitem-label">مدة التجديد</span>
                <span className="billitem-val">{CYCLE_AR[cycle]}</span>
              </div>
              <div className="billitem" style={{ marginBottom: 14 }}>
                <span className="billitem-label">الفترة الجديدة</span>
                <span className="billitem-val">{formatDate(newStart)} — {formatDate(newEnd)}</span>
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
                <button className="btn btn-primary" type="button" disabled={loading} style={primaryBtnS} onClick={applyRenew}>
                  {loading ? <><Loader2 className="auth-spin" /> جارٍ التأكيد...</> : <><ShieldCheck /> تأكيد التجديد عبر ZainCash</>}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setCheckout(false)} disabled={loading} style={secondaryBtnS}>تراجع</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const primaryBtnS: React.CSSProperties = { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const secondaryBtnS: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border-default)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--color-surface)' }

export default ExtendRenewPage
