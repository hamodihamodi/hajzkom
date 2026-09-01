import { useState } from 'react'
import {
  CalendarDays,
  Clock,
  Mail,
  MapPin,
  Phone,
  Scissors,
  User,
} from 'lucide-react'
import {
  getAppointmentById,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from '../../utils/appointments'
import { STATUS_AR, STATUS_COLORS } from '../../utils/appointments'
import { toast } from '../../utils/toast'
import { formatSlot12h } from '../../utils/booking'
import type { Session } from '../../utils/accounts'
import { timeToMinutes, toTimeKey } from '../../utils/datetime'

function formatDateAr(d: string): string {
  const [y, m, day] = d.split('-').map(Number)
  const dt = new Date(y, m - 1, day)
  const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${weekdays[dt.getDay()]} ${day} ${months[dt.getMonth()]} ${y}`
}

interface AppointmentDetailPageProps {
  appointmentId: string
  session: Session
  onBack: () => void
}

export function AppointmentDetailPage({ appointmentId, session, onBack }: AppointmentDetailPageProps) {
  const [appt] = useState<Appointment | null>(() => getAppointmentById(appointmentId))
  const [status, setStatus] = useState<AppointmentStatus>(appt?.status ?? 'confirmed')
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canReschedule = session.role === 'owner' || session.role === 'admin'

  if (!appt) {
    return (
      <div className="dash-placeholder">
        <div className="dash-ph-inner">
          <span className="dash-ph-ic"><CalendarDays /></span>
          <h2>الموعد غير موجود</h2>
          <p>لم يتم العثور على هذا الموعد.</p>
          <button type="button" onClick={onBack} style={{ marginTop: 16, ...actionBtnS, background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }}>
            العودة
          </button>
        </div>
      </div>
    )
  }

  const endTime = toTimeKey(timeToMinutes(appt.time) + appt.durationMin)

  const handleStatus = (newStatus: AppointmentStatus) => {
    if (newStatus === 'cancelled') {
      setConfirmAction('cancelled')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      updateAppointmentStatus(appt.id, newStatus)
      setStatus(newStatus)
      toast(`تم تحديث الحالة إلى "${STATUS_AR[newStatus]}".`)
      setLoading(false)
    }, 300)
  }

  const confirmCancel = () => {
    setLoading(true)
    window.setTimeout(() => {
      updateAppointmentStatus(appt.id, 'cancelled')
      setStatus('cancelled')
      toast('تم إلغاء الموعد.')
      setLoading(false)
      setConfirmAction(null)
    }, 300)
  }

  const openReschedule = () => {
    window.location.hash = `#/dashboard/appointment/${appt.id}/reschedule`
  }

  return (
    <>
      {/* ── Back button ── */}
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20,
          padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border-default)',
          background: 'var(--color-surface)', fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text-secondary)',
        }}
      >
        <ChevronRightIcon /> العودة للجدول
      </button>

      <div className="dash-section" style={{ maxWidth: 600 }}>
        <div className="dash-section-head">
          <span className="dash-section-title"><CalendarDays /> تفاصيل الموعد</span>
          <span style={{
            fontSize: '0.78rem', fontWeight: 600, padding: '5px 14px',
            borderRadius: '999px', background: STATUS_COLORS[status].bg, color: STATUS_COLORS[status].text,
          }}>
            {STATUS_AR[status]}
          </span>
        </div>

        <div style={{ padding: 24 }}>
          {/* ── Service & time ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={labelS}>الخدمة</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Scissors size={15} /> {appt.serviceName}
              </div>
            </div>
            <div>
              <div style={labelS}>المدة</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                <Clock size={14} style={{ marginInlineEnd: 4 }} />{appt.durationMin} دقيقة
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={labelS}>التاريخ</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{formatDateAr(appt.date)}</div>
            </div>
            <div>
              <div style={labelS}>الوقت</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {formatSlot12h(appt.time)} – {formatSlot12h(endTime)}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={labelS}>الموقع</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={15} /> {appt.locationName}
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', margin: '20px 0' }} />

          {/* ── Customer ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={labelS}>الزبون</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={15} /> {appt.customerName}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={labelS}>الهاتف</div>
              <div style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }} dir="ltr">
                <Phone size={14} /> {appt.customerPhone || '—'}
              </div>
            </div>
            <div>
              <div style={labelS}>البريد الإلكتروني</div>
              <div style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} /> {appt.customerEmail || '—'}
              </div>
            </div>
          </div>

          {/* ── Notes ── */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', margin: '20px 0' }} />

          {appt.customerNotes && (
            <div style={{ marginBottom: 16 }}>
              <div style={labelS}>ملاحظات الزبون</div>
              <div style={noteBoxS}>{appt.customerNotes}</div>
            </div>
          )}
          {appt.staffNotes && (
            <div style={{ marginBottom: 16 }}>
              <div style={labelS}>ملاحظات الموظف</div>
              <div style={noteBoxS}>{appt.staffNotes}</div>
            </div>
          )}
          {!appt.customerNotes && !appt.staffNotes && (
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', margin: 0 }}>لا توجد ملاحظات.</p>
          )}

          {/* ── Actions ── */}
          {(status === 'confirmed' || status === 'pending' || status === 'no-show') && (
            <>
              <div style={{ borderTop: '1px solid var(--color-border-subtle)', margin: '20px 0' }} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button" disabled={loading}
                  onClick={() => handleStatus('completed')}
                  style={{ ...actionBtnS, background: 'var(--color-success)', color: '#fff', borderColor: 'var(--color-success)' }}
                >
                  مكتمل
                </button>
                {status !== 'no-show' && (
                  <button
                    type="button" disabled={loading}
                    onClick={() => handleStatus('no-show')}
                    style={{ ...actionBtnS, background: 'var(--color-warning)', color: '#fff', borderColor: 'var(--color-warning)' }}
                  >
                    لم يحضر
                  </button>
                )}
                {canReschedule && (
                  <button
                    type="button" disabled={loading}
                    onClick={openReschedule}
                    style={{ ...actionBtnS, background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }}
                  >
                    <CalendarDays size={14} style={{ marginInlineEnd: 4, verticalAlign: 'middle' }} />
                    إعادة جدولة
                  </button>
                )}
                <button
                  type="button" disabled={loading}
                  onClick={() => handleStatus('cancelled')}
                  style={{ ...actionBtnS, background: 'var(--color-error)', color: '#fff', borderColor: 'var(--color-error)' }}
                >
                  إلغاء
                </button>
              </div>
            </>
          )}

          {/* ── Cancel confirmation ── */}
          {confirmAction === 'cancelled' && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'var(--color-error-background)', border: '1px solid var(--color-error)' }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--color-error)' }}>هل أنت متأكد من إلغاء هذا الموعد؟</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" disabled={loading} onClick={confirmCancel} style={{ ...actionBtnS, background: 'var(--color-error)', color: '#fff', borderColor: 'var(--color-error)' }}>
                  نعم، إلغاء
                </button>
                <button type="button" disabled={loading} onClick={() => setConfirmAction(null)} style={{ ...actionBtnS, borderColor: 'var(--color-border-default)' }}>
                  تراجع
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      </>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

const labelS: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 4 }
const noteBoxS: React.CSSProperties = {
  fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7,
  padding: '10px 14px', background: 'var(--color-surface-subtle)', borderRadius: 8,
}
const actionBtnS: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, border: '1px solid',
  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center',
}

export default AppointmentDetailPage
