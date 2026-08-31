import { useState, useMemo, useRef, useEffect } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Phone,
  Scissors,
} from 'lucide-react'
import type { Business } from '../../utils/business'
import {
  getAppointmentsForBusiness,
  type Appointment,
  type AppointmentStatus,
} from '../../utils/appointments'
import { STATUS_AR, STATUS_COLORS } from '../../utils/appointments'
import { formatSlot12h } from '../../utils/booking'

const PAGE_SIZE = 8

interface CalendarPageProps {
  business: Business
}

function formatDateAr(d: string): string {
  const [y, m, day] = d.split('-').map(Number)
  const dt = new Date(y, m - 1, day)
  const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${weekdays[dt.getDay()]} ${day} ${months[dt.getMonth()]} ${y}`
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function CalendarPage({ business }: CalendarPageProps) {
  const locations = business.locations
  const services = business.services

  const [locationFilter, setLocationFilter] = useState(locations[0]?.id ?? 'all')
  const [fromDate, setFromDate] = useState(todayStr())
  const [toDate, setToDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const allAppts = useMemo(() => {
    const firstLoc = locations[0]
    let list = getAppointmentsForBusiness(business.id, firstLoc?.id, firstLoc?.name)
    if (locationFilter !== 'all') {
      list = list.filter((a) => a.locationId === locationFilter)
    }
    list = list.filter((a) => a.date >= fromDate && a.date <= toDate)
    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter)
    }
    if (serviceFilter !== 'all') {
      list = list.filter((a) => a.serviceId === serviceFilter)
    }
    list.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.time.localeCompare(b.time)
    })
    return list
  }, [business.id, locationFilter, fromDate, toDate, statusFilter, serviceFilter, locations])

  const totalPages = Math.ceil(allAppts.length / PAGE_SIZE)
  const visibleAppts = allAppts.slice(0, page * PAGE_SIZE)
  const hasMore = page < totalPages

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((p) => p + 1)
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, page])

  const prevWeek = () => {
    const d = new Date(fromDate)
    d.setDate(d.getDate() - 7)
    const t = new Date(toDate)
    t.setDate(t.getDate() - 7)
    setFromDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    setToDate(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`)
    setPage(1)
  }

  const nextWeek = () => {
    const d = new Date(fromDate)
    d.setDate(d.getDate() + 7)
    const t = new Date(toDate)
    t.setDate(t.getDate() + 7)
    setFromDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    setToDate(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`)
    setPage(1)
  }

  const todayQuick = () => {
    setFromDate(todayStr())
    setToDate(todayStr())
    setPage(1)
  }

  const weekQuick = () => {
    setFromDate(todayStr())
    const d = new Date()
    d.setDate(d.getDate() + 7)
    setToDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    setPage(1)
  }

  const groupByDate = (appts: Appointment[]) => {
    const groups: { date: string; items: Appointment[] }[] = []
    let current = ''
    for (const a of appts) {
      if (a.date !== current) {
        current = a.date
        groups.push({ date: a.date, items: [] })
      }
      groups[groups.length - 1].items.push(a)
    }
    return groups
  }

  const groups = groupByDate(visibleAppts)

  return (
    <>
      {/* ── Location switcher ── */}
      {locations.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <MapPin size={15} style={{ color: 'var(--color-text-tertiary)' }} />
          <select
            value={locationFilter}
            onChange={(e) => { setLocationFilter(e.target.value); setPage(1) }}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid var(--color-border-default)',
              fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-surface)',
            }}
          >
            <option value="all">جميع المواقع</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Date range + nav ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button type="button" onClick={prevWeek} style={navBtnS} title="الأسبوع السابق"><ChevronRight /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <input
            type="date" value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
            style={dateInputS}
          />
          <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>إلى</span>
          <input
            type="date" value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1) }}
            style={dateInputS}
          />
        </div>
        <button type="button" onClick={nextWeek} style={navBtnS} title="الأسبوع التالي"><ChevronLeft /></button>
      </div>

      {/* ── Quick buttons + filters ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button type="button" onClick={todayQuick} style={quickBtnS}>اليوم</button>
        <button type="button" onClick={weekQuick} style={quickBtnS}>هذا الأسبوع</button>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={() => setShowFilters(!showFilters)} style={{ ...quickBtnS, color: showFilters ? 'var(--color-primary)' : undefined }}>
          <Filter /> فلتر
        </button>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>الحالة:</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as AppointmentStatus | 'all'); setPage(1) }}
              style={filterSelectS}
            >
              <option value="all">الكل</option>
              <option value="confirmed">مؤكد</option>
              <option value="pending">قيد الانتظار</option>
              <option value="completed">مكتمل</option>
              <option value="no-show">لم يحضر</option>
              <option value="cancelled">ملغى</option>
            </select>
          </div>
          {services.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>الخدمة:</label>
              <select
                value={serviceFilter}
                onChange={(e) => { setServiceFilter(e.target.value); setPage(1) }}
                style={filterSelectS}
              >
                <option value="all">الكل</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ── Results count ── */}
      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginBottom: 14 }}>
        {allAppts.length} {allAppts.length === 1 ? 'موعد' : 'مواعيد'}
      </div>

      {/* ── Appointment list ── */}
      {allAppts.length === 0 ? (
        <div className="dash-section">
          <div className="dash-empty" style={{ padding: '40px 20px' }}>
            <span className="dash-empty-ic"><CalendarDays /></span>
            <p>لا توجد مواعيد في هذه الفترة.</p>
          </div>
        </div>
      ) : (
        <div className="dash-section">
          {groups.map((group) => (
            <div key={group.date}>
              <div style={{
                padding: '10px 20px', background: 'var(--color-surface-subtle)',
                fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-secondary)',
                borderBottom: '1px solid var(--color-border-subtle)',
                position: 'sticky', top: 0, zIndex: 5,
              }}>
                {formatDateAr(group.date)}
              </div>
              {group.items.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => { window.location.hash = `#/dashboard/appointment/${appt.id}` }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px', borderBottom: '1px solid var(--color-border-subtle)',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <span style={{
                    minWidth: 60, textAlign: 'center', fontSize: '0.82rem', fontWeight: 700,
                    color: 'var(--color-primary)', background: 'var(--color-primary-subtle)',
                    padding: '6px 8px', borderRadius: 8, lineHeight: 1.2,
                  }}>
                    {formatSlot12h(appt.time)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 2 }}>{appt.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Scissors size={12} />
                      <span>{appt.serviceName}</span>
                      <span>·</span>
                      <span>{appt.durationMin} دقيقة</span>
                      {appt.customerPhone && (
                        <>
                          <span>·</span>
                          <Phone size={11} />
                          <span>{appt.customerPhone}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px',
                    borderRadius: '999px', whiteSpace: 'nowrap',
                    background: STATUS_COLORS[appt.status].bg,
                    color: STATUS_COLORS[appt.status].text,
                  }}>
                    {STATUS_AR[appt.status]}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Infinite scroll sentinel ── */}
      {hasMore && (
        <div
          ref={sentinelRef}
          style={{ textAlign: 'center', padding: '18px 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
        >
          جارٍ تحميل المزيد…
        </div>
      )}
      {!hasMore && allAppts.length > 0 && (
        <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          نهاية النتائج ({allAppts.length} موعد)
        </div>
      )}
    </>
  )
}

const navBtnS: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 36, height: 36, borderRadius: 8, border: '1px solid var(--color-border-default)',
  background: 'var(--color-surface)', cursor: 'pointer', color: 'var(--color-text-primary)',
}
const dateInputS: React.CSSProperties = {
  padding: '7px 10px', borderRadius: 8, border: '1px solid var(--color-border-default)',
  fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-surface)',
}
const quickBtnS: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8,
  border: '1px solid var(--color-border-default)', background: 'var(--color-surface)',
  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text-secondary)',
}
const filterSelectS: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 8, border: '1px solid var(--color-border-default)',
  fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-surface)',
}

export default CalendarPage
