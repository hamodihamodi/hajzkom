import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Scissors,
  User,
  ArrowLeftRight,
} from 'lucide-react'
import {
  getAppointmentById,
  loadAppointments,
  rescheduleAppointment,
} from '../../utils/appointments'
import { STATUS_AR, STATUS_COLORS } from '../../utils/appointments'
import { toast } from '../../utils/toast'
import { formatSlot12h, getDayHours } from '../../utils/booking'
import { generateSlotTimes, timeToMinutes, toTimeKey, dateKey } from '../../utils/datetime'
import type { Session } from '../../utils/accounts'
import type { Business } from '../../utils/business'
import type { BusinessLocationInfo } from '../../types'

function formatDateAr(d: string): string {
  const [y, m, day] = d.split('-').map(Number)
  const dt = new Date(y, m - 1, day)
  const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${weekdays[dt.getDay()]} ${day} ${months[dt.getMonth()]} ${y}`
}

function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface RescheduleAppointmentPageProps {
  appointmentId: string
  session: Session
  business: Business
  onBack: () => void
}

export function RescheduleAppointmentPage({ appointmentId, session, business, onBack }: RescheduleAppointmentPageProps) {
  const [appt, setAppt] = useState(() => getAppointmentById(appointmentId))
  const [locationId, setLocationId] = useState(appt?.locationId ?? business.locations[0]?.id ?? '')
  const [date, setDate] = useState(appt?.date ?? toDateInput(new Date()))
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  const isOwnerOrAdmin = session.role === 'owner' || session.role === 'admin'

  const location: BusinessLocationInfo | null = business.locations.find((l) => l.id === locationId) ?? null

  const slots = useMemo(() => {
    if (!location || !date) return []
    const [y, m, d] = date.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    const hours = getDayHours(location, dt)
    if (!hours) return []
    const isToday = dateKey(new Date()) === date
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
    const busyTimes = loadAppointments()
      .filter((a) => a.locationId === locationId && a.date === date && a.status !== 'cancelled' && a.id !== appt?.id)
      .map((a) => a.time)
    return generateSlotTimes(hours.open, hours.close, 30).filter((t) => {
      if (isToday && timeToMinutes(t) <= nowMin) return false
      if (busyTimes.includes(t)) return false
      return true
    })
  }, [location, date, locationId, appt])

  const originalEnd = appt ? toTimeKey(timeToMinutes(appt.time) + appt.durationMin) : ''
  const newEnd = time ? toTimeKey(timeToMinutes(time) + (appt?.durationMin ?? 0)) : ''

  if (!isOwnerOrAdmin) {
    return (
      <div className="dash-placeholder">
        <div className="dash-ph-inner">
          <span className="dash-ph-ic"><CalendarDays /></span>
          <h2>لا تملك صلاحية</h2>
          <p>إعادة الجدولة متاحة للمالك والمشرف فقط.</p>
          <button type="button" onClick={onBack} style={{ marginTop: 16, ...actionBtnS, background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }}>
            العودة
          </button>
        </div>
      </div>
    )
  }

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

  const hasChange = time && (date !== appt.date || time !== appt.time || locationId !== appt.locationId)

  const confirmReschedule = () => {
    if (!time) {
      toast('اختر وقتاً جديداً.')
      return
    }
    if (!hasChange) {
      toast('لا يوجد تغيير في الموعد.')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      const updated = rescheduleAppointment(appt.id, date, time, locationId, location?.name)
      if (updated) {
        setAppt(updated)
        toast(`تمت إعادة الجدولة إلى ${formatDateAr(date)} - ${formatSlot12h(time)}.`)
        onBack()
      } else {
        setLoading(false)
        toast('تعذر إعادة الجدولة.')
      }
    }, 300)
  }

  return (
    <>
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
        <ChevronRightIcon /> العودة للتفاصيل
      </button>

      <div className="dash-section" style={{ maxWidth: 600 }}>
        <div className="dash-section-head">
          <span className="dash-section-title"><CalendarDays /> إعادة جدولة الموعد</span>
          <span style={{
            fontSize: '0.78rem', fontWeight: 600, padding: '5px 14px',
            borderRadius: '999px', background: STATUS_COLORS[appt.status].bg, color: STATUS_COLORS[appt.status].text,
          }}>
            {STATUS_AR[appt.status]}
          </span>
        </div>

        <div style={{ padding: 24 }}>
          {/* ── Appointment summary ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={labelS}>الزبون</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={15} /> {appt.customerName}
              </div>
            </div>
            <div>
              <div style={labelS}>الخدمة</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Scissors size={15} /> {appt.serviceName}
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>· {appt.durationMin} دقيقة</span>
              </div>
            </div>
          </div>

          {/* ── Choices ── */}
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={labelS}>الموقع</div>
              <select
                value={locationId}
                disabled={loading}
                onChange={(e) => { setLocationId(e.target.value); setTime('') }}
                style={inputS}
              >
                {business.locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={labelS}>التاريخ</div>
              <input
                type="date"
                value={date}
                min={toDateInput(new Date())}
                disabled={loading}
                onChange={(e) => { setDate(e.target.value); setTime('') }}
                style={inputS}
              />
            </div>

            <div>
              <div style={labelS}>الوقت الجديد</div>
              {slots.length === 0 ? (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.82rem', margin: 0 }}>
                  لا توجد أوقات متاحة لهذا اليوم (الموقع مغلق أو اكتمل الحجز).
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
                  {slots.map((t) => {
                    const selected = t === time
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={loading}
                        onClick={() => setTime(t)}
                        style={{
                          padding: '8px 4px', borderRadius: 8, border: '1px solid',
                          borderColor: selected ? 'var(--color-primary)' : 'var(--color-border-default)',
                          background: selected ? 'var(--color-primary)' : 'var(--color-surface)',
                          color: selected ? '#fff' : 'var(--color-text-primary)',
                          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        {formatSlot12h(t)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Comparison ── */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', margin: '20px 0' }} />
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeftRight size={13} /> المقارنة قبل التأكيد
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 10, background: 'var(--color-surface-subtle)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>الموعد الحالي</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <MapPin size={14} style={{ color: 'var(--color-text-muted)' }} /> {appt.locationName}
              </div>
              <div style={{ fontSize: '0.88rem', marginBottom: 4 }}>{formatDateAr(appt.date)}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                <Clock size={13} style={{ marginInlineEnd: 4, verticalAlign: 'middle' }} />
                {formatSlot12h(appt.time)} – {formatSlot12h(originalEnd)}
              </div>
            </div>

            <div style={{
              padding: 14, borderRadius: 10,
              background: hasChange ? 'var(--color-primary-background, #eef6f6)' : 'var(--color-surface-subtle)',
              border: hasChange ? '1px solid var(--color-primary)' : '1px dashed var(--color-border-default)',
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: hasChange ? 'var(--color-primary)' : 'var(--color-text-tertiary)', marginBottom: 8 }}>
                الموعد الجديد {hasChange ? '· جاهز للتأكيد' : ''}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <MapPin size={14} style={{ color: 'var(--color-text-muted)' }} /> {location?.name ?? '—'}
              </div>
              <div style={{ fontSize: '0.88rem', marginBottom: 4 }}>{date ? formatDateAr(date) : '—'}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: time ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                <Clock size={13} style={{ marginInlineEnd: 4, verticalAlign: 'middle' }} />
                {time ? `${formatSlot12h(time)} – ${formatSlot12h(newEnd)}` : 'لم يتم الاختيار'}
              </div>
            </div>
          </div>

          {/* ── Action ── */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
            <button
              type="button" disabled={loading}
              onClick={onBack}
              style={{ ...actionBtnS, borderColor: 'var(--color-border-default)' }}
            >
              تراجع
            </button>
            <button
              type="button" disabled={loading || !time || !hasChange}
              onClick={confirmReschedule}
              style={{ ...actionBtnS, background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }}
            >
              {loading ? <Spinner /> : <Check size={14} style={{ marginInlineEnd: 4, verticalAlign: 'middle' }} />}
              تأكيد إعادة الجدولة
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Spinner() {
  return (
    <span
      className="spin-circle"
      style={{
        display: 'inline-block', width: 14, height: 14, marginInlineEnd: 6,
        border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
        borderRadius: '50%', verticalAlign: 'middle',
      }}
    />
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
const actionBtnS: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, border: '1px solid',
  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center',
}
const inputS: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border-default)',
  background: 'var(--color-surface)', fontSize: '0.85rem', fontFamily: 'inherit',
  color: 'var(--color-text-primary)', boxSizing: 'border-box',
}

export default RescheduleAppointmentPage