import { useEffect, useMemo, useState } from 'react'
import {
  AlarmClock,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Lock,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react'

import type { BusinessInfo, BusinessLocationInfo, ServiceInfo } from '../../types'
import { sampleBusiness } from '../../data/business'
import { formatDateShort, formatTime12h, weekdayName } from '../../utils/datetime'
import {
  buildSlots,
  buildUpcomingDates,
  formatSlot12h,
  generateBookingRef,
  isDateClosed,
  slotsFullyBooked,
  validateCustomer,
  apiDelay,
  type BookingSelection,
  type SlotInfo,
} from '../../utils/booking'
import { NotFoundState, StateSwitcher, WarningState } from '../../components/ui/UiStates'

function WhatsAppGlyph({ className = 'wa-ic' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 448 512" aria-hidden="true">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  )
}

function InstagramGlyph() {
  return (
    <svg className="lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookGlyph() {
  return (
    <svg className="lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 16, height: 16 }}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function AlertGlyph() {
  return (
    <svg className="lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function NotesGlyph() {
  return (
    <svg className="lucide" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

interface CustomerDetails {
  fullName: string
  phone: string
  email: string
  notes: string
}

const EMPTY_CUSTOMER: CustomerDetails = { fullName: '', phone: '', email: '', notes: '' }

interface PublicBookingPageProps {
  business?: BusinessInfo
}

const WEEK_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const MONTHS_SHORT = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

export function PublicBookingPage({ business = sampleBusiness }: PublicBookingPageProps) {
  const [loading, setLoading] = useState(true)
  const [locationId, setLocationId] = useState(business.locations[0]?.id ?? '')
  const location = business.locations.find((l) => l.id === locationId) ?? business.locations[0]

  const [serviceId, setServiceId] = useState<string | null>(null)
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<string | null>(null)

  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER)
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({})
  const [touched, setTouched] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [scenario, setScenario] = useState<'normal' | 'closed' | 'not_found'>('normal')

  const dates = useMemo(() => buildUpcomingDates(14), [])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const service = business.services.find((s) => s.id === serviceId) ?? null

  const slots: SlotInfo[] = useMemo(() => {
    if (!location) return []
    return buildSlots(location, date, time)
  }, [location, date, time])

  const closedDay = !!location && isDateClosed(location, date)
  const fullyBooked = !closedDay && slotsFullyBooked(slots)
  const noServices = business.services.length === 0
  const monthlyReached = business.monthlyLimitReached
  const reviewComplete = !!service && !!time
  const progressPhase = !service ? 1 : !time ? 2 : 3

  function selectService(id: string) {
    setServiceId(id)
    setTime(null)
  }

  function selectDate(d: Date) {
    setDate(d)
    setTime(null)
  }

  function chooseTime(t: string) {
    setTime(t)
  }

  function updateCustomer(field: keyof CustomerDetails, value: string) {
    setCustomer((c) => ({ ...c, [field]: value }))
    if (errors[field as 'fullName']) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function handleConfirm() {
    const validation = validateCustomer(customer.fullName, customer.phone, customer.email)
    setErrors(validation)
    setTouched(true)
    if (Object.keys(validation).length > 0 || !service || !time) return

    setConfirming(true)
    await apiDelay(1100)
    setBookingRef(generateBookingRef())
    setConfirming(false)
    setConfirmed(true)
  }

  function resetBooking() {
    setConfirmed(false)
    setServiceId(null)
    setTime(null)
    setCustomer(EMPTY_CUSTOMER)
    setTouched(false)
    setErrors({})
  }

  function copyRef() {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(bookingRef)
  }

  const todayHours = location ? getTodayHours(location) : null
  const openNowText = location ? getOpenNowText(location) : 'مغلق الآن'

  if (loading) {
    return (
      <div className="bk-loading">
        <div className="bk-spinner" />
        <span>جارٍ تحميل بيانات النشاط...</span>
      </div>
    )
  }

  if (confirmed) {
    return (
      <SuccessView
        businessName={business.name}
        service={service as ServiceInfo}
        time={time as string}
        date={date}
        customer={customer}
        refCode={bookingRef}
        onAgain={resetBooking}
        onCopy={copyRef}
      />
    )
  }

  if (scenario !== 'normal') {
    return (
      <div className="bk-page">
        <header className="bk-topbar">
          <div className="bk-topbar-inner">
            <div className="bk-topbar-logo">
              <span>
                <b>حجز</b>كوم
              </span>
            </div>
          </div>
        </header>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 20px 40px' }}>
          <div style={{ marginBottom: 16 }}>
            <StateSwitcher
              title="سيناريوهات صفحة الحجز العامة"
              hint="بدّل بين حالات العرض لتجربة الحالات المشتركة:"
              options={[
                { key: 'normal', label: 'وضع طبيعي' },
                { key: 'closed', label: 'مغلق اليوم', desc: 'closed' },
                { key: 'not_found', label: 'النشاط غير موجود', desc: '404' },
              ]}
              value={scenario}
              onChange={(k) => setScenario(k as typeof scenario)}
            />
          </div>
          {scenario === 'closed' ? (
            <div className="dash-section">
              <div className="dash-section-body" style={{ padding: '30px 20px' }}>
                <WarningState
                  title="النشاط مغلق اليوم"
                  message="عذراً، هذا النشاط لا يستقبل الحجوزات في هذا اليوم. جرّب موعداً آخر."
                />
              </div>
            </div>
          ) : (
            <div className="dash-section">
              <div className="dash-section-body" style={{ padding: '30px 20px' }}>
                <NotFoundState
                  title="النشاط غير موجود"
                  message="لم نتمكن من العثور على هذه الصفحة. قد يكون الرابط غير صحيح."
                  onBack={() => setScenario('normal')}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bk-page">
      <header className="bk-topbar">
        <div className="bk-topbar-inner">
          <div className="bk-topbar-logo">
            <span>
              <b>حجز</b>كوم
            </span>
          </div>
          <span className="bk-topbar-badge">
            <span className="bk-pulse-dot" /> حجز مباشر
          </span>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '12px 20px 0' }}>
        <StateSwitcher
          title="سيناريوهات صفحة الحجز العامة"
          hint="بدّل بين حالات العرض لتجربة الحالات المشتركة:"
          options={[
            { key: 'normal', label: 'وضع طبيعي' },
            { key: 'closed', label: 'مغلق اليوم', desc: 'closed' },
            { key: 'not_found', label: 'النشاط غير موجود', desc: '404' },
          ]}
          value={scenario}
          onChange={(k) => setScenario(k as typeof scenario)}
        />
      </div>

      <section className="bk-cover" aria-hidden="true">
        <div className="bk-cover-shape" />
      </section>

      {/* ===== معلومات النشاط ===== */}
      <section className="bk-biz-card">
        <div className="bk-biz-inner">
          <div className="bk-biz-logo">{business.logoInitial}</div>
          <div className="bk-biz-main">
            <h1 className="bk-biz-name">{business.name}</h1>
            <p className="bk-biz-desc">{business.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 12 }}>
              <span className="bk-meta-row" style={{ marginInlineEnd: 16 }}>
                <Star /> {business.rating ?? '4.9'} · تقييم الزبائن
              </span>
              <a className="bk-meta-row" href={business.phoneLink} style={{ textDecoration: 'none' }}>
                <Phone /> {business.phoneDisplay}
              </a>
            </div>
          </div>
          <div className="bk-biz-meta">
            {business.locations.length > 1 && (
              <div className="bk-location-select">
                <MapPin />
                <select
                  value={locationId}
                  onChange={(e) => {
                    setLocationId(e.target.value)
                    setTime(null)
                  }}
                  aria-label="اختر الفرع"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                  }}
                >
                  {business.locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <span className="bk-meta-row">
              <AlarmClock /> {todayHours ? `ساعات اليوم: ${todayHours.open} – ${todayHours.close}` : 'مغلق اليوم'}
            </span>
            <span className="bk-meta-row">
              <span className={`bk-hours-dot${openNowText === 'مغلق الآن' ? ' closed' : ''}`} />
              {openNowText}
            </span>
            <div className="bk-meta-row" style={{ gap: 10 }}>
              <SocialLinks business={business} />
            </div>
          </div>
        </div>
      </section>

      {monthlyReached && (
        <div className="bk-layout" style={{ gridTemplateColumns: '1fr' }}>
          <div className="bk-state-box">
            <CalendarDays />
            <div className="bk-state-title">بلغ النشاط الحد الشهري للحجوزات</div>
            <div className="bk-state-text">
              عذراً، تم الوصول إلى الحد الأقصى لحجوزات هذا الشهر. عد لاحقاً أو تواصل مع النشاط مباشرة.
            </div>
          </div>
        </div>
      )}

      {!monthlyReached && (
        <div className="bk-layout">
          {/* ===== العمود الأساسي ===== */}
          <div className="bk-col">
            <div className="bk-progress" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`bk-prog${progressPhase >= n ? ' done' : ''}`} />
              ))}
            </div>

            {/* ===== 1) اختيار الخدمة ===== */}
            <section className="bk-card" aria-labelledby="bk-service-title">
              <CardHead icon={Scissors} title="اختر الخدمة" step="1 / 3" />
              {noServices ? (
                <div className="bk-state-box">
                  <Scissors />
                  <div className="bk-state-title">لا توجد خدمات متاحة حالياً</div>
                  <div className="bk-state-text">
                    لم يقم النشاط بإضافة أي خدمات بعد. يمكنك التواصل معنا مباشرة للحجز.
                  </div>
                </div>
              ) : (
                <div className="bk-services-list">
                  {business.services.map((s: ServiceInfo) => (
                    <button
                      type="button"
                      key={s.id}
                      className={`bk-service${serviceId === s.id ? ' active' : ''}`}
                      onClick={() => selectService(s.id)}
                    >
                      <span className="bk-radio" />
                      <span className="bk-service-name">{s.name}</span>
                      <span className="bk-service-dur">
                        <Clock /> {formatDuration(s.durationMin)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {!noServices && (
              /* ===== 2) التاريخ والوقت ===== */
              <section className="bk-card" aria-labelledby="bk-time-title">
                <CardHead icon={CalendarDays} title="اختر التاريخ والوقت" step="2 / 3" />

                <div className="bk-dates" role="radiogroup" aria-label="اختر اليوم">
                  {dates.map((d) => {
                    const closed = location ? isDateClosed(location, d) : false
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        role="radio"
                        aria-checked={sameDate(d, date)}
                        className={`bk-date${sameDate(d, date) ? ' active' : ''}`}
                        disabled={closed}
                        onClick={() => selectDate(d)}
                      >
                        <span className="bk-date-dow">{weekdayName(d)}</span>
                        <span className="bk-date-num">{d.getDate()}</span>
                        <span className="bk-date-mon">{MONTHS_SHORT[d.getMonth()]}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="bk-date-legend">
                  <span>
                    <span className="bk-legend-dot legend-avail" /> متاح
                  </span>
                  <span>
                    <span className="bk-legend-dot legend-full" /> محجوز/مكتمل
                  </span>
                  <span>
                    <span className="bk-legend-dot legend-past" /> فات الموعد
                  </span>
                </div>

                <div style={{ marginTop: 14 }}>
                  {closedDay ? (
                    <div className="bk-state-box">
                      <CalendarDays />
                      <div className="bk-state-title">النشاط مغلق في هذا اليوم</div>
                      <div className="bk-state-text">
                        الفرع مغلق في {formatDateShort(date)}. اختر يوماً آخر من الأيام المتاحة أعلاه.
                      </div>
                    </div>
                  ) : fullyBooked ? (
                    <div className="bk-state-box">
                      <CalendarDays />
                      <div className="bk-state-title">تم حجز كل المواعيد لهذا اليوم</div>
                      <div className="bk-state-text">
                        امتلأت المواعيد في {formatDateShort(date)}. جرّب يوماً آخر من القائمة.
                      </div>
                    </div>
                  ) : (
                    <div className="bk-time-grid" role="radiogroup" aria-label="اختر الوقت">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          role="radio"
                          aria-checked={time === slot.time}
                          className={`bk-time${time === slot.time ? ' selected' : ''}`}
                          disabled={!slot.available}
                          onClick={() => chooseTime(slot.time)}
                        >
                          {formatSlot12h(slot.time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {!noServices && (
              /* ===== 3) بيانات الزبون ===== */
              <section className="bk-card" aria-labelledby="bk-customer-title">
                <CardHead icon={User} title="بياناتك" step="3 / 3" />

                <div className="bk-field">
                  <label htmlFor="bk-name">
                    الاسم الكامل <span className="bk-req">*</span>
                  </label>
                  <input
                    id="bk-name"
                    className={`bk-input${errors.fullName ? ' invalid' : ''}`}
                    value={customer.fullName}
                    onChange={(e) => updateCustomer('fullName', e.target.value)}
                    placeholder="مثال: زينب علي"
                    autoComplete="name"
                  />
                  {errors.fullName && (
                    <span className="bk-input-err">
                      <AlertGlyph /> {errors.fullName}
                    </span>
                  )}
                </div>

                <div className="bk-field">
                  <label htmlFor="bk-phone">
                    رقم الهاتف <span className="bk-req">*</span>
                  </label>
                  <input
                    id="bk-phone"
                    className={`bk-input${errors.phone ? ' invalid' : ''}`}
                    value={customer.phone}
                    onChange={(e) => updateCustomer('phone', e.target.value)}
                    placeholder="07XX XXX XXXX"
                    dir="ltr"
                    style={{ textAlign: 'end' }}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <span className="bk-input-err">
                      <AlertGlyph /> {errors.phone}
                    </span>
                  )}
                </div>

                <div className="bk-field">
                  <label htmlFor="bk-email">
                    البريد الإلكتروني <span className="bk-hint">(اختياري)</span>
                  </label>
                  <input
                    id="bk-email"
                    className={`bk-input${errors.email ? ' invalid' : ''}`}
                    value={customer.email}
                    onChange={(e) => updateCustomer('email', e.target.value)}
                    placeholder="you@example.com"
                    dir="ltr"
                    style={{ textAlign: 'end' }}
                    inputMode="email"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <span className="bk-input-err">
                      <AlertGlyph /> {errors.email}
                    </span>
                  )}
                </div>

                <div className="bk-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="bk-notes">
                    ملاحظات <span className="bk-hint">(اختياري)</span>
                  </label>
                  <textarea
                    id="bk-notes"
                    className="bk-input bk-textarea"
                    value={customer.notes}
                    onChange={(e) => updateCustomer('notes', e.target.value)}
                    placeholder="أي تفاصيل إضافية تودّ إخبار النشاط بها..."
                  />
                </div>
              </section>
            )}
          </div>

          {/* ===== عمود مراجعة الحجز ===== */}
          <aside className="bk-col bk-review-col" aria-label="مراجعة الحجز">
            <section className="bk-card">
              <CardHead icon={CheckCircle2} title="مراجعة الحجز" />

              {!reviewComplete ? (
                <div className="bk-review-empty">
                  <CalendarDays />
                  <div className="bk-state-title">حجزك سيتجمع هنا</div>
                  <div className="bk-state-text">
                    اختر خدمة ثم وقتاً وشاهد ملخص حجزك هنا. بياناتك ستُعرض عند تعبئتها.
                  </div>
                </div>
              ) : (
                <>
                  <div className="bk-summ">
                    <div className="bk-summ-row">
                      <span className="bk-summ-label">
                        <Scissors /> الخدمة
                      </span>
                      <span className="bk-summ-val">
                        {service!.name}
                        <div className="bk-dur-line">
                          <Clock /> {formatDuration(service!.durationMin)}
                        </div>
                      </span>
                    </div>
                    <hr className="bk-sep" />
                    <div className="bk-summ-row">
                      <span className="bk-summ-label">
                        <CalendarDays /> التاريخ
                      </span>
                      <span className="bk-summ-val">{formatDateShort(date)}</span>
                    </div>
                    <hr className="bk-sep" />
                    <div className="bk-summ-row">
                      <span className="bk-summ-label">
                        <Clock /> الوقت
                      </span>
                      <span className="bk-summ-val">{formatTime12h(time!)}</span>
                    </div>
                    {location && (
                      <>
                        <hr className="bk-sep" />
                        <div className="bk-summ-row">
                          <span className="bk-summ-label">
                            <MapPin /> الفرع
                          </span>
                          <span className="bk-summ-val">{location.name}</span>
                        </div>
                      </>
                    )}
                    {customer.fullName && (
                      <>
                        <hr className="bk-sep" />
                        <div className="bk-summ-row">
                          <span className="bk-summ-label">
                            <User /> الاسم
                          </span>
                          <span className="bk-summ-val">{customer.fullName}</span>
                        </div>
                      </>
                    )}
                    {customer.phone && (
                      <>
                        <hr className="bk-sep" />
                        <div className="bk-summ-row">
                          <span className="bk-summ-label">
                            <Phone /> الهاتف
                          </span>
                          <span className="bk-summ-val" dir="ltr">
                            {customer.phone}
                          </span>
                        </div>
                      </>
                    )}
                    {customer.notes && (
                      <>
                        <hr className="bk-sep" />
                        <div className="bk-summ-row">
                          <span className="bk-summ-label">
                            <NotesGlyph /> ملاحظات
                          </span>
                          <span className="bk-summ-val">
                            <span className="bk-summ-note">{customer.notes}</span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {touched && !customer.fullName && (
                    <div className="bk-state-box" style={{ padding: 12, marginTop: 14 }}>
                      <div className="bk-state-title" style={{ fontSize: '0.85rem' }}>
                        أكمل بياناتك ثم اضغط تأكيد
                      </div>
                      <div className="bk-state-text" style={{ fontSize: '0.78rem' }}>
                        الاسم ورقم الهاتف مطلوبان لإتمام الحجز.
                      </div>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-block bk-confirm-btn"
                    type="button"
                    onClick={handleConfirm}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <>
                        <Loader2 className="lucide" style={{ animation: 'bk-rot .8s linear infinite' }} /> جارٍ تأكيد
                        الحجز...
                      </>
                    ) : (
                      <>
                        <Check /> تأكيد الحجز
                      </>
                    )}
                  </button>
                  <div className="bk-safety">
                    <Lock /> بدون تسجيل — بياناتك محفوظة ومشفّرة
                  </div>
                </>
              )}
            </section>

            {(!service || noServices) && (
              <div className="bk-card">
                <CardHead icon={ShieldCheck} title="لن تحتاج حساباً" />
                <p className="bk-state-text" style={{ textAlign: 'start' }}>
                  يكفي اسمك ورقم هاتفك للحجز. سيصلك تأكيد عبر واتساب من النشاط. لا نحتفظ بأي بيانات دفع.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      <footer
        className="bk-footer"
        style={{
          textAlign: 'center',
          padding: '28px 24px',
          borderTop: '1px solid var(--color-border-default)',
          color: 'var(--color-text-tertiary)',
          fontSize: '.82rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 6 }}>
          <Phone /> {business.phoneDisplay}
        </div>
        © {new Date().getFullYear()} {business.name} — الحجز عبر منصة حجزكوم
      </footer>
    </div>
  )
}

function CardHead({
  icon: Icon,
  title,
  step,
}: {
  icon: typeof Scissors
  title: string
  step?: string
}) {
  return (
    <div className="bk-card-head">
      <span className="bk-card-ic">
        <Icon />
      </span>
      <h2 className="bk-card-title">{title}</h2>
      {step && <span className="bk-card-step">{step}</span>}
    </div>
  )
}

function SuccessView({
  businessName,
  service,
  time,
  date,
  customer,
  refCode,
  onAgain,
  onCopy,
}: {
  businessName: string
  service: ServiceInfo
  time: string
  date: Date
  customer: CustomerDetails
  refCode: string
  onAgain: () => void
  onCopy: () => void
}) {
  return (
    <div className="bk-success">
      <div className="bk-success-card">
        <div className="bk-suc-ic">
          <CheckCircle2 />
        </div>
        <h1>تم تأكيد حجزك</h1>
        <p>
          شكراً لك يا {customer.fullName.split(' ')[0] || 'زبوننا العزيز'}! تم إرسال تأكيد الحجز إلى رقمك عبر واتساب وستصلك
          رسالة تذكير قبل الموعد.
        </p>
        <div className="bk-success-detail">
          <div className="bk-summ-row">
            <span className="bk-summ-label">
              <Scissors /> الخدمة
            </span>
            <span className="bk-summ-val">{service.name}</span>
          </div>
          <div className="bk-summ-row">
            <span className="bk-summ-label">
              <CalendarDays /> التاريخ
            </span>
            <span className="bk-summ-val">{formatDateShort(date)}</span>
          </div>
          <div className="bk-summ-row">
            <span className="bk-summ-label">
              <Clock /> الوقت
            </span>
            <span className="bk-summ-val">{formatTime12h(time)}</span>
          </div>
          <div className="bk-summ-row">
            <span className="bk-summ-label">رقم الحجز</span>
            <span className="bk-summ-val" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span dir="ltr">{refCode}</span>
              <button
                type="button"
                onClick={onCopy}
                aria-label="نسخ رقم الحجز"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
              >
                <Copy className="lucide" style={{ width: 14, height: 14 }} />
              </button>
            </span>
          </div>
        </div>
        <div className="bk-note">
          <WhatsAppGlyph /> تذكير واتساب سيصلك قبل الموعد بساعة — {businessName}
        </div>
        <button className="btn btn-ghost btn-block" type="button" onClick={onAgain} style={{ marginTop: 20 }}>
          <CalendarDays /> حجز موعد آخر
        </button>
      </div>
    </div>
  )
}

function SocialLinks({ business }: { business: BusinessInfo }) {
  const waHref = `https://wa.me/${business.whatsappNumber}`
  return (
    <>
      {business.socials?.instagram && (
        <a
          href={business.socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="انستغرام"
          style={{ display: 'inline-flex', color: 'var(--color-primary)' }}
        >
          <InstagramGlyph />
        </a>
      )}
      {business.socials?.facebook && (
        <a
          href={business.socials.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="فيسبوك"
          style={{ display: 'inline-flex', color: 'var(--color-primary)' }}
        >
          <FacebookGlyph />
        </a>
      )}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="واتساب"
        style={{ display: 'inline-flex', color: 'var(--color-primary)' }}
      >
        <WhatsAppGlyph />
      </a>
    </>
  )
}

function getTodayHours(location: BusinessLocationInfo): { open: string; close: string } | null {
  const dayName = WEEK_NAMES[new Date().getDay()]
  const day = location?.hours.find((h) => h.day === dayName)
  if (!day || !day.open || !day.close) return null
  return { open: day.open, close: day.close }
}

function getOpenNowText(location: BusinessLocationInfo): string {
  const hours = getTodayHours(location)
  if (!hours) return 'مغلق الآن'
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const openMin = Number(hours.open.split(':')[0]) * 60 + Number(hours.open.split(':')[1])
  const closeMin = Number(hours.close.split(':')[0]) * 60 + Number(hours.close.split(':')[1])
  if (nowMin >= openMin && nowMin <= closeMin) return 'مفتوح الآن'
  return 'مغلق الآن'
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} دقيقة`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} ساعة و${m} دقيقة` : `${h} ساعة`
}

export type { BookingSelection }
