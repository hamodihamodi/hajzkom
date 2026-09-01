import { useMemo } from 'react'
import {
  CalendarDays,
  Clock,
  Mail,
  MapPin,
  Phone,
  Scissors,
  StickyNote,
  User,
} from 'lucide-react'
import type { Business } from '../../utils/business'
import {
  appointmentsForCustomer,
  customerSummaryFromAppointments,
} from '../../utils/customers'
import { STATUS_AR, STATUS_COLORS } from '../../utils/appointments'
import { formatSlot12h } from '../../utils/booking'

interface CustomerProfilePageProps {
  business: Business
  customerKey: string
  onBack: () => void
}

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

function fmtDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const dt = new Date(y, m - 1, d)
  return `${WEEKDAYS[dt.getDay()]} ${d} ${MONTHS[dt.getMonth()]} ${y}`
}

function initials(name: string): string {
  const t = name.trim()
  if (!t) return '؟'
  return t.charAt(0)
}

export function CustomerProfilePage({ business, customerKey, onBack }: CustomerProfilePageProps) {
  const appointments = useMemo(
    () => appointmentsForCustomer(business, customerKey),
    [business, customerKey],
  )
  const summary = useMemo(
    () => customerSummaryFromAppointments(appointments),
    [appointments],
  )

  if (!summary) {
    return (
      <div className="dash-placeholder">
        <div className="dash-ph-inner">
          <span className="dash-ph-ic"><User /></span>
          <h2>الزبون غير موجود</h2>
          <p>لم يتم العثور على هذا الزبون.</p>
          <button
            type="button"
            onClick={onBack}
            style={{
              marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 10, border: 'none',
              background: 'var(--color-primary)', color: '#fff',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            العودة للزبائن
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── Back ── */}
      <button type="button" onClick={onBack} style={backBtnS}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        العودة للزبائن
      </button>

      {/* ── Identity card ── */}
      <div className="dash-section">
        <div className="cprof-hero">
          <span className="cprof-avatar">{initials(summary.name)}</span>
          <div className="cprof-hero-info">
            <div className="cprof-name">{summary.name || '—'}</div>
            <div className="cprof-contact">
              {summary.phone && (
                <span><Phone size={14} /><span dir="ltr">{summary.phone}</span></span>
              )}
              {summary.email && (
                <span><Mail size={14} /><span dir="ltr">{summary.email}</span></span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Customer info stats ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title"><User /> معلومات الزبون</span>
        </div>
        <div className="cprof-stats">
          <div className="cprof-stat">
            <span className="cprof-stat-ic"><CalendarDays /></span>
            <div className="cprof-stat-num">{summary.bookings}</div>
            <div className="cprof-stat-label">{summary.bookings === 1 ? 'حجز' : 'حجزاً'}</div>
          </div>
          <div className="cprof-stat">
            <span className="cprof-stat-ic"><CalendarDays /></span>
            <div className="cprof-stat-txt">{fmtDate(summary.lastDate)}</div>
            <div className="cprof-stat-label">آخر زيارة</div>
          </div>
          <div className="cprof-stat">
            <span className="cprof-stat-ic"><CalendarDays /></span>
            <div className="cprof-stat-txt">{fmtDate(summary.firstDate)}</div>
            <div className="cprof-stat-label">أول زيارة</div>
          </div>
        </div>
        {summary.lastNotes && (
          <div style={{ padding: '0 20px 18px' }}>
            <div style={{ marginBottom: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <StickyNote size={14} /> آخر الملاحظات
            </div>
            <div style={noteBoxS}>{summary.lastNotes}</div>
          </div>
        )}
      </div>

      {/* ── Appointment history ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title"><Scissors /> سجل الحجوزات</span>
          <span className="dash-section-action">{appointments.length} {appointments.length === 1 ? 'موعد' : 'مواعيد'}</span>
        </div>

        {appointments.length === 0 ? (
          <div className="dash-empty">
            <span className="dash-empty-ic"><Scissors /></span>
            <p>لا توجد حجوزات لهذا الزبون.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="cprof-table-wrap">
              <table className="cprof-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الوقت</th>
                    <th>الخدمة</th>
                    <th>الموقع</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td>{fmtDate(a.date)}</td>
                      <td>{formatSlot12h(a.time)}</td>
                      <td className="cprof-svc">{a.serviceName}</td>
                      <td>{a.locationName}</td>
                      <td>
                        <span className="dash-appt-status" style={{ background: STATUS_COLORS[a.status].bg, color: STATUS_COLORS[a.status].text }}>
                          {STATUS_AR[a.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="cprof-cards">
              {appointments.map((a) => (
                <div className="cprof-card" key={a.id}>
                  <div className="cprof-card-top">
                    <span className="cprof-card-date">
                      {fmtDate(a.date)}
                    </span>
                    <span className="dash-appt-status" style={{ background: STATUS_COLORS[a.status].bg, color: STATUS_COLORS[a.status].text }}>
                      {STATUS_AR[a.status]}
                    </span>
                  </div>
                  <div className="cprof-card-row"><Clock size={14} /> {formatSlot12h(a.time)}</div>
                  <div className="cprof-card-row"><Scissors size={14} /> {a.serviceName}</div>
                  <div className="cprof-card-row"><MapPin size={14} /> {a.locationName}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

const backBtnS: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20,
  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border-default)',
  background: 'var(--color-surface)', fontSize: '0.85rem', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text-secondary)',
}
const noteBoxS: React.CSSProperties = {
  fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7,
  padding: '10px 14px', background: 'var(--color-surface-subtle)', borderRadius: 8,
}

export default CustomerProfilePage