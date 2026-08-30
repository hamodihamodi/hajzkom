import { useState, useMemo } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Phone,
  Scissors,
  X,
} from 'lucide-react'
import type { Business } from '../../utils/business'
import {
  getAppointmentsForBusiness,
  type Appointment,
  type AppointmentStatus,
} from '../../utils/appointments'
import { STATUS_AR, STATUS_COLORS, updateAppointmentStatus } from '../../utils/appointments'
import { toast } from '../../utils/toast'
import { formatSlot12h } from '../../utils/booking'

const PAGE_SIZE = 8

interface CalendarPageProps {
  business: Business
  onRefresh: () => void
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

export function CalendarPage({ business, onRefresh }: CalendarPageProps) {
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
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null)

  const allAppts = useMemo(() => {
    let list = getAppointmentsForBusiness(business.id)
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
  }, [business.id, locationFilter, fromDate, toDate, statusFilter, serviceFilter])

  const totalPages = Math.ceil(allAppts.length / PAGE_SIZE)
  const visibleAppts = allAppts.slice(0, page * PAGE_SIZE)
  const hasMore = page < totalPages

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
                  onClick={() => setDetailAppt(appt)}
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

      {/* ── Load more ── */}
      {hasMore && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: '10px 24px', borderRadius: 10, border: '1px solid var(--color-border-default)',
              background: 'var(--color-surface)', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text-primary)',
            }}
          >
            تحميل المزيد ({allAppts.length - visibleAppts.length} متبقي)
          </button>
        </div>
      )}

      {/* ── Detail modal ── */}
      {detailAppt && (
        <AppointmentDetailModal
          appt={detailAppt}
          onClose={() => { setDetailAppt(null); onRefresh() }}
        />
      )}
    </>
  )
}

function AppointmentDetailModal({
  appt,
  onClose,
}: {
  appt: Appointment
  onClose: () => void
}) {
  const [status, setStatus] = useState(appt.status)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="dash-overlay open" onClick={onClose}>
      <div
        className="dash-section"
        style={{ position: 'relative', width: '100%', maxWidth: 520, margin: '6vh auto', cursor: 'default', maxHeight: '88vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dash-section-head">
          <span className="dash-section-title"><CalendarDays /> تفاصيل الموعد</span>
          <button className="dash-section-action" type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
        </div>

        <div style={{ padding: 20 }}>
          {/* ── Status badge ── */}
          <div style={{ marginBottom: 16 }}>
            <span style={{
              display: 'inline-block', fontSize: '0.78rem', fontWeight: 600, padding: '5px 14px',
              borderRadius: '999px', background: STATUS_COLORS[status].bg, color: STATUS_COLORS[status].text,
            }}>
              {STATUS_AR[status]}
            </span>
          </div>

          {/* ── Service & time ── */}
          <div style={fieldRowS}>
            <div style={fieldBoxS}>
              <div style={fieldLabelS}>الخدمة</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{appt.serviceName}</div>
            </div>
            <div style={fieldBoxS}>
              <div style={fieldLabelS}>المدة</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{appt.durationMin} دقيقة</div>
            </div>
          </div>
          <div style={fieldRowS}>
            <div style={fieldBoxS}>
              <div style={fieldLabelS}>التاريخ</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatDateAr(appt.date)}</div>
            </div>
            <div style={fieldBoxS}>
              <div style={fieldLabelS}>الوقت</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatSlot12h(appt.time)}</div>
            </div>
          </div>
          <div style={fieldRowS}>
            <div style={fieldBoxS}>
              <div style={fieldLabelS}>الموقع</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{appt.locationName}</div>
            </div>
          </div>

          {/* ── Customer ── */}
          <div style={{ ...fieldRowS, marginTop: 16 }}>
            <div style={fieldBoxS}>
              <div style={fieldLabelS}>الزبون</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{appt.customerName}</div>
            </div>
          </div>
          <div style={fieldRowS}>
            <div style={fieldBoxS}>
              <div style={fieldLabelS}>الهاتف</div>
              <div style={{ fontSize: '0.9rem' }} dir="ltr">{appt.customerPhone || '—'}</div>
            </div>
            <div style={fieldBoxS}>
              <div style={fieldLabelS}>البريد</div>
              <div style={{ fontSize: '0.9rem' }}>{appt.customerEmail || '—'}</div>
            </div>
          </div>

          {/* ── Notes ── */}
          {appt.customerNotes && (
            <div style={{ marginTop: 14 }}>
              <div style={fieldLabelS}>ملاحظات الزبون</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, padding: '10px 14px', background: 'var(--color-surface-subtle)', borderRadius: 8 }}>
                {appt.customerNotes}
              </div>
            </div>
          )}
          {appt.staffNotes && (
            <div style={{ marginTop: 10 }}>
              <div style={fieldLabelS}>ملاحظات الموظف</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, padding: '10px 14px', background: 'var(--color-surface-subtle)', borderRadius: 8 }}>
                {appt.staffNotes}
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          {(status === 'confirmed' || status === 'pending' || status === 'no-show') && (
            <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
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
              <button
                type="button" disabled={loading}
                onClick={() => handleStatus('cancelled')}
                style={{ ...actionBtnS, background: 'var(--color-error)', color: '#fff', borderColor: 'var(--color-error)' }}
              >
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* ── Cancel confirmation ── */}
        {confirmAction === 'cancelled' && (
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ padding: 14, borderRadius: 10, background: 'var(--color-error-background)', border: '1px solid var(--color-error)' }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--color-error)' }}>هل أنت متأكد من إلغاء هذا الموعد؟</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button" disabled={loading}
                  onClick={confirmCancel}
                  style={{ ...actionBtnS, background: 'var(--color-error)', color: '#fff', borderColor: 'var(--color-error)' }}
                >
                  نعم، إلغاء
                </button>
                <button
                  type="button" disabled={loading}
                  onClick={() => setConfirmAction(null)}
                  style={{ ...actionBtnS, borderColor: 'var(--color-border-default)' }}
                >
                  تراجع
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
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
const fieldLabelS: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 4 }
const fieldBoxS: React.CSSProperties = { flex: 1, minWidth: 120 }
const fieldRowS: React.CSSProperties = { display: 'flex', gap: 14, marginBottom: 6 }
const actionBtnS: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, border: '1px solid',
  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}

export default CalendarPage
