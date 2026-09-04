import { useState } from 'react'
import { CreditCard, Filter, Wallet } from 'lucide-react'
import type { Business } from '../../utils/business'
import { PLAN_PRICING } from '../../utils/billing'
import {
  getPayments,
  PAYMENT_STATUS_AR,
  PAYMENT_STATUS_TONE,
  type PaymentStatus,
} from '../../utils/payments'
import { EmptyStateView } from '../../components/ui/UiStates'

const FILTERS: Array<{ key: PaymentStatus | 'all'; label: string }> = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'قيد الانتظار' },
  { key: 'paid', label: 'مدفوع' },
  { key: 'failed', label: 'فشل' },
  { key: 'refunded', label: 'مسترد' },
  { key: 'expired', label: 'منتهي' },
]

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDateTime(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

interface PaymentsPageProps {
  business: Business
  onOpenPayment: (paymentId: string) => void
}

export function PaymentsPage({ business, onOpenPayment }: PaymentsPageProps) {
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all')
  const [payments] = useState(() => getPayments(business.id))

  const sorted = [...payments].sort((a, b) => b.date - a.date)
  const filtered = filter === 'all' ? sorted : sorted.filter((p) => p.status === filter)
  const counts = FILTERS.slice(1).reduce<Record<string, number>>((acc, f) => {
    acc[f.key] = sorted.filter((p) => p.status === f.key).length
    return acc
  }, {})

  return (
    <>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          <CreditCard size={14} style={{ verticalAlign: '-2px', marginInlineEnd: 4 }} />
          سجل المدفوعات
        </span>
      </div>

      {/* ── Filter bar ── */}
      <div className="pay-filters">
        <span className="pay-filters-label"><Filter size={14} /> الحالة:</span>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`pay-filter${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key !== 'all' && <span className="pay-filter-count">{counts[f.key] ?? 0}</span>}
          </button>
        ))}
      </div>

      {/* ── Desktop table ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title"><Wallet /> المدفوعات</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyStateView
            icon={<Wallet size={22} />}
            title="لا توجد مدفوعات في هذه الحالة"
            message="جرّب فلترة حالة أخرى، أو انتظر وصول أول دفعة عبر ZainCash."
          />
        ) : (
          <>
            <div className="pay-table-wrap">
              <table className="pay-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الخطة</th>
                    <th>المبلغ</th>
                    <th>البوابة</th>
                    <th>الحالة</th>
                    <th>تاريخ الدفع</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="pay-row" onClick={() => onOpenPayment(p.id)}>
                      <td>{fmtDate(p.date)}</td>
                      <td>{PLAN_PRICING[p.plan].name}</td>
                      <td style={{ fontWeight: 700 }}>{p.amount.toLocaleString('en-US')} د.ع</td>
                      <td>{p.gateway}</td>
                      <td>
                        <span className="pay-status" style={{ color: PAYMENT_STATUS_TONE[p.status], background: 'var(--color-surface-muted)' }}>
                          {PAYMENT_STATUS_AR[p.status]}
                        </span>
                      </td>
                      <td>{p.paidAt ? fmtDateTime(p.paidAt) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="pay-cards">
              {filtered.map((p) => (
                <div className="pay-card" key={p.id} onClick={() => onOpenPayment(p.id)}>
                  <div className="pay-card-top">
                    <span className="pay-card-plan">{PLAN_PRICING[p.plan].name}</span>
                    <span className="pay-status" style={{ color: PAYMENT_STATUS_TONE[p.status], background: 'var(--color-surface-muted)' }}>
                      {PAYMENT_STATUS_AR[p.status]}
                    </span>
                  </div>
                  <div className="pay-card-amount">{p.amount.toLocaleString('en-US')} <span>د.ع</span></div>
                  <div className="pay-card-row"><span>التاريخ</span><b>{fmtDate(p.date)}</b></div>
                  <div className="pay-card-row"><span>البوابة</span><b>{p.gateway}</b></div>
                  <div className="pay-card-row"><span>تاريخ الدفع</span><b>{p.paidAt ? fmtDateTime(p.paidAt) : '—'}</b></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default PaymentsPage
