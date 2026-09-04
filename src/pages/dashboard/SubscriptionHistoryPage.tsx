import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CalendarPlus,
  CircleDashed,
  History,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react'
import type { Business } from '../../utils/business'
import {
  getSubscriptionHistory,
  planPack,
  SUBSCRIPTION_EVENT_AR,
  type SubscriptionEvent,
  type SubscriptionEventType,
} from '../../utils/subscriptionHistory'

const TYPE_META: Record<SubscriptionEventType, { icon: React.ReactNode; tone: string }> = {
  created: { icon: <Sparkles size={17} />, tone: 'var(--color-primary)' },
  upgraded: { icon: <ArrowUp size={17} />, tone: 'var(--color-success)' },
  downgraded: { icon: <ArrowDown size={17} />, tone: 'var(--color-warning)' },
  cancelled: { icon: <XCircle size={17} />, tone: 'var(--color-error)' },
  extended: { icon: <CalendarPlus size={17} />, tone: 'var(--color-info)' },
  cancellation_reverted: { icon: <RotateCcw size={17} />, tone: 'var(--color-success)' },
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function fmtAmount(n?: number): string {
  return n === undefined ? '' : `${n.toLocaleString('en-US')} د.ع`
}

function planChangeLabel(ev: SubscriptionEvent): string {
  const same = ev.fromPlan === ev.toPlan
  if (same) return planPack(ev.toPlan)
  return `${planPack(ev.fromPlan)} → ${planPack(ev.toPlan)}`
}

interface SubscriptionHistoryPageProps {
  business: Business
}

export function SubscriptionHistoryPage({ business }: SubscriptionHistoryPageProps) {
  const [events] = useState<SubscriptionEvent[]>(() => getSubscriptionHistory(business.id))
  const sorted = [...events].sort((a, b) => b.date - a.date)

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          <History size={14} style={{ verticalAlign: '-2px', marginInlineEnd: 4 }} />
          سجل الاشتراك — كل التغييرات على خطتك
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="dash-section">
          <div className="dash-section-body" style={{ textAlign: 'center', padding: 40 }}>
            <span className="dash-stat-ic primary" style={{ margin: '0 auto 14px' }}>
              <History size={26} />
            </span>
            <p>لا توجد أحداث على الاشتراك حتى الآن.</p>
          </div>
        </div>
      ) : (
        <div className="dash-section">
          <div className="dash-section-head">
            <span className="dash-section-title"><History /> الخط الزمني</span>
          </div>
          <div className="dash-section-body">
            <div className="sub-his-timeline">
              {sorted.map((ev, i) => {
                const meta = TYPE_META[ev.type]
                const isLast = i === sorted.length - 1
                return (
                  <div className="sub-his-item" key={ev.id}>
                    <div className="sub-his-rail">
                      <span className="sub-his-dot" style={{ background: meta.tone }}>{meta.icon}</span>
                      {!isLast && <span className="sub-his-line" />}
                    </div>
                    <div className="sub-his-card">
                      <div className="sub-his-head">
                        <strong>{SUBSCRIPTION_EVENT_AR[ev.type]}</strong>
                        <span className="sub-his-date">{fmtDate(ev.date)}</span>
                      </div>
                      <div className="sub-his-plan">
                        <span className="sub-his-plan-tag">{planChangeLabel(ev)}</span>
                        {ev.amount !== undefined && (
                          <span className="sub-his-amount">{fmtAmount(ev.amount)}</span>
                        )}
                      </div>
                      {ev.reason && (
                        <p className="sub-his-reason">السبب: {ev.reason}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--color-text-tertiary)', marginTop: 16 }}>
              <CircleDashed size={13} /> تُسجَّل الأحداث تلقائياً عند الترقية أو التخفيض أو التجديد أو الإلغاء.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default SubscriptionHistoryPage