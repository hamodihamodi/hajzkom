import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Scissors,
  User,
  UserPlus,
} from 'lucide-react'
import type { Business } from '../../utils/business'
import type { BusinessLocationInfo, ServiceInfo } from '../../types'
import {
  createAppointment,
  getAppointmentsAt,
} from '../../utils/appointments'
import {
  formatSlot12h,
  getDayHours,
  isBusinessOpen,
  validateCustomer,
} from '../../utils/booking'
import {
  addDays,
  dateKey,
  formatDateShort,
  generateSlotTimes,
  sameDay,
  timeToMinutes,
  toTimeKey,
  weekdayName,
} from '../../utils/datetime'
import { toast } from '../../utils/toast'

interface WalkInBookingPageProps {
  business: Business
}

const MONTHS_SHORT = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

export function WalkInBookingPage({ business }: WalkInBookingPageProps) {
  const locations = business.locations
  const services = business.services
  const primaryLocation = locations[0]

  // الموقع الحالي تلقائياً (الموقع الأول/الافتراضي في اللوحة)
  const [locationId, setLocationId] = useState(primaryLocation?.id ?? '')
  const location: BusinessLocationInfo | null =
    locations.find((l) => l.id === locationId) ?? primaryLocation ?? null

  const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
  const service: ServiceInfo | null = services.find((s) => s.id === serviceId) ?? null

  // التاريخ الافتراضي: اليوم
  const [date, setDate] = useState<Date>(new Date())

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [time, setTime] = useState('')
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  // نافذة الحجز: الأيام المتاحة ضمن bookingWindowDays
  const dateList: Date[] = useMemo(() => {
    const windowDays = Math.max(1, business.bookingWindowDays || 30)
    return Array.from({ length: windowDays }, (_, i) => addDays(new Date(), i))
  }, [business.bookingWindowDays])

  // الأوقات المتاحة للتاريخ والموقع المختارين (ضمن دوام الموقع، وبعد الآن، ولنفس الموقع غير المحجوز)
  const slots: string[] = useMemo(() => {
    if (!location) return []
    const hours = getDayHours(location, date)
    if (!hours) return []
    const today = sameDay(date, new Date())
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
    const ds = dateKey(date)
    return generateSlotTimes(hours.open, hours.close, 30).filter((t) => {
      if (today && timeToMinutes(t) <= nowMin) return false
      const taken = getAppointmentsAt(location.id, ds, t).length > 0
      return !taken
    })
  }, [location, date])

  const noLocations = locations.length === 0
  const noServices = services.length === 0
  const closedDay = !!location && !isBusinessOpen(location, date)
  const noSlots = !closedDay && slots.length === 0

  function selectDate(d: Date) {
    setDate(d)
    setTime('')
  }

  function onServiceChange(id: string) {
    setServiceId(id)
    setTime('')
  }

  function setField(field: 'customerName' | 'customerPhone' | 'customerEmail' | 'customerNotes', value: string) {
    if (field === 'customerName') setCustomerName(value)
    else if (field === 'customerPhone') setCustomerPhone(value)
    else if (field === 'customerEmail') setCustomerEmail(value)
    else setCustomerNotes(value)
    const errKey = field === 'customerName' ? 'fullName' : field === 'customerPhone' ? 'phone' : field === 'customerEmail' ? 'email' : null
    if (errKey && errors[errKey]) {
      setErrors((e) => ({ ...e, [errKey]: undefined }))
    }
  }

  function handleSubmit() {
    const validation = validateCustomer(customerName, customerPhone, customerEmail)
    setErrors(validation)
    if (!service) {
      toast('اختر خدمة أولاً.')
      return
    }
    if (!time) {
      toast('اختر وقتاً متاحاً.')
      return
    }
    if (Object.keys(validation).length > 0) return

    setSaving(true)
    window.setTimeout(() => {
      createAppointment({
        businessId: business.id,
        locationId: location!.id,
        locationName: location!.name,
        serviceId: service.id,
        serviceName: service.name,
        durationMin: service.durationMin,
        date: dateKey(date),
        time,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerNotes: customerNotes.trim(),
        status: 'confirmed',
      })
      setSaving(false)
      setDone(true)
    }, 500)
  }

  function resetForm() {
    setDone(false)
    setTime('')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setCustomerNotes('')
    setErrors({})
  }

  const endTime = time && service ? toTimeKey(timeToMinutes(time) + service.durationMin) : ''

  if (done) {
    return (
      <div className="dash-section" style={{ maxWidth: 560 }}>
        <div className="dash-section-head">
          <span className="dash-section-title"><CheckCircle2 /> تم الحجز المباشر</span>
        </div>
        <div style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: 'var(--color-success-background)', color: 'var(--color-success)', marginBottom: 14 }}>
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 6px' }}>
            تم إضافة الحجز لجدولك
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: '0 0 18px' }}>
            {customerName} · {service?.name} · {formatDateShort(date)} · {formatSlot12h(time)}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={resetForm}
              style={{ ...actionBtnS, background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }}
            >
              <UserPlus size={15} /> حجز مباشر آخر
            </button>
            <a
              href="#/dashboard/calendar"
              style={{ ...actionBtnS, textDecoration: 'none', color: 'var(--color-text-primary)', borderColor: 'var(--color-border-default)', background: 'var(--color-surface)' }}
            >
              <CalendarDays size={15} /> عرض الجدول
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="dash-section" style={{ maxWidth: 720 }}>
        <div className="dash-section-head">
          <span className="dash-section-title"><UserPlus /> حجز مباشر (Walk-in)</span>
          {location && (
            <span className="dash-section-action"><MapPin size={14} /> {location.name}</span>
          )}
        </div>

        <div style={{ padding: 20 }}>
          {noLocations || noServices ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--color-text-tertiary)' }}>
              <CalendarDays size={28} style={{ marginBottom: 8 }} />
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                {noLocations ? 'لا توجد مواقع بعد' : 'لا توجد خدمات بعد'}
              </p>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                {noLocations
                  ? 'أضف موقعاً من صفحة المواقع والأوقات لبدء استقبال الحجوزات.'
                  : 'أضف خدمة من صفحة الخدمات لبدء استقبال الحجوزات.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 18 }}>
              {/* ── الخدمة ── */}
              <div>
                <div style={labelS}><Scissors size={13} /> الخدمة</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                  {services.map((s) => {
                    const selected = s.id === serviceId
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onServiceChange(s.id)}
                        style={{
                          padding: '12px 14px', borderRadius: 10, border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border-default)'}`,
                          background: selected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                          color: selected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                          textAlign: 'start', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.name}</div>
                        <div style={{ fontSize: '0.72rem', color: selected ? 'var(--color-primary)' : 'var(--color-text-tertiary)', marginTop: 2 }}>
                          <Clock size={11} style={{ verticalAlign: '-1px' }} /> {s.durationMin} دقيقة
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── الموقع (يظهر فقط عند تعدد المواقع؛ الافتراضي هو الموقع الحالي) ── */}
              {locations.length > 1 && (
                <div>
                  <div style={labelS}><MapPin size={13} /> الموقع</div>
                  <select value={locationId} onChange={(e) => { setLocationId(e.target.value); setTime('') }} style={inputS(false)}>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* ── التاريخ ── */}
              <div>
                <div style={labelS}><CalendarDays size={13} /> التاريخ — الافتراضي اليوم</div>
                <div className="walkin-dates" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                  {dateList.map((d) => {
                    const closed = location ? !isBusinessOpen(location, d) : true
                    const selected = sameDay(d, date)
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        disabled={closed}
                        onClick={() => selectDate(d)}
                        style={{
                          flex: '0 0 auto', minWidth: 64, textAlign: 'center', padding: '10px 8px', borderRadius: 10,
                          border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border-default)'}`,
                          background: selected ? 'var(--color-primary)' : 'var(--color-surface)',
                          color: selected ? '#fff' : closed ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
                          cursor: closed ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: closed ? 0.5 : 1,
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', fontWeight: 600 }}>{weekdayName(d)}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800 }}>{d.getDate()}</div>
                        <div style={{ fontSize: '0.62rem' }}>{MONTHS_SHORT[d.getMonth()]}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── الأوقات المتاحة ── */}
              <div>
                <div style={labelS}><Clock size={13} /> الوقت المتاح</div>
                {closedDay ? (
                  <div style={noteBoxS}>الموقع مغلق في هذا اليوم — اختر يوماً آخر.</div>
                ) : noSlots ? (
                  <div style={noteBoxS}>لا توجد أوقات متاحة لهذا اليوم (انتهت الأوقات أو امتلأت الحجوزات).</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))', gap: 8, maxHeight: 190, overflowY: 'auto' }}>
                    {slots.map((t) => {
                      const selected = t === time
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTime(t)}
                          style={{
                            padding: '9px 6px', borderRadius: 8, border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border-default)'}`,
                            background: selected ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: selected ? '#fff' : 'var(--color-text-primary)',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          {formatSlot12h(t)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── بيانات الزبون ── */}
              <div>
                <div style={labelS}><User size={13} /> بيانات الزبون</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setField('customerName', e.target.value)}
                      placeholder="اسم الزبون *"
                      style={inputS(!!errors.fullName)}
                    />
                    {errors.fullName && <span style={errS}>{errors.fullName}</span>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setField('customerPhone', e.target.value)}
                      placeholder="رقم الهاتف *"
                      dir="ltr"
                      style={{ ...inputS(!!errors.phone), textAlign: 'end' }}
                      inputMode="tel"
                    />
                    {errors.phone && <span style={errS}>{errors.phone}</span>}
                  </div>
                  <div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setField('customerEmail', e.target.value)}
                      placeholder="البريد الإلكتروني (اختياري)"
                      dir="ltr"
                      style={{ ...inputS(!!errors.email), textAlign: 'end' }}
                      inputMode="email"
                    />
                    {errors.email && <span style={errS}>{errors.email}</span>}
                  </div>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setField('customerNotes', e.target.value)}
                    placeholder="ملاحظات (اختياري)"
                    rows={2}
                    style={inputS(false)}
                  />
                </div>
              </div>

              {/* ── ملخص وزر التأكيد ── */}
              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 16 }}>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                  <span>{service && (<><Scissors size={13} style={{ verticalAlign: '-2px' }} /> {service.name}</>)}</span>
                  {time && <span><CalendarDays size={13} style={{ verticalAlign: '-2px' }} /> {formatDateShort(date)} · {formatSlot12h(time)}{endTime ? ` – ${formatSlot12h(endTime)}` : ''}</span>}
                  {customerName && <span><User size={13} style={{ verticalAlign: '-2px' }} /> {customerName}</span>}
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSubmit}
                  style={{ ...actionBtnS, background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)', padding: '11px 22px', fontSize: '0.88rem' }}
                >
                  {saving ? (
                    <><Loader2 size={15} style={{ animation: 'var(--spin, spin 0.8s linear infinite)' }} /> جارٍ الحجز...</>
                  ) : (
                    <><Check size={15} /> تأكيد الحجز المباشر</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const labelS: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700,
  color: 'var(--color-text-secondary)', marginBottom: 8,
}
const inputS = (error: boolean): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-default)'}`,
  fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
})
const errS: React.CSSProperties = { display: 'block', marginTop: 4, fontSize: '0.78rem', color: 'var(--color-error)' }
const noteBoxS: React.CSSProperties = {
  fontSize: '0.82rem', color: 'var(--color-text-tertiary)',
  padding: '12px 16px', background: 'var(--color-surface-subtle)', borderRadius: 10,
}
const actionBtnS: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
  border: '1px solid', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
  fontFamily: 'inherit', background: 'var(--color-surface)',
}

export default WalkInBookingPage