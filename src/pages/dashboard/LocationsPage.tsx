import { useState, type FormEvent } from 'react'
import {
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from '../../utils/toast'
import type { Session } from '../../utils/accounts'
import type { Business } from '../../utils/business'
import {
  addLocation,
  canAddLocation,
  updateLocation,
  updateLocationHours,
  locationLimitForPlan,
  removeLocation,
} from '../../utils/business'
import { getAppointmentsForBusiness } from '../../utils/appointments'
import type { BusinessLocationInfo, DayHours } from '../../types'

const DAYS = [
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الاثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
  { key: 'friday', label: 'الجمعة' },
  { key: 'saturday', label: 'السبت' },
]

function defaultHours(): DayHours[] {
  return DAYS.map((d) => ({
    day: d.key,
    open: '09:00',
    close: '21:00',
    closed: d.key === 'friday',
  }))
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function hoursSummary(hours: DayHours[]): string {
  if (!hours || hours.length === 0) return 'لم تُحدَّد بعد'
  const openDays = hours.filter((h) => !h.closed)
  if (openDays.length === 0) return 'مغلق طوال الأسبوع'
  return `${openDays.length} أيام مفتوحة`
}

interface LocationsPageProps {
  session: Session
  business: Business
  onRefresh: () => void
}

type ModalState =
  | null
  | { kind: 'add' }
  | { kind: 'edit-name'; loc: BusinessLocationInfo }
  | { kind: 'edit-hours'; loc: BusinessLocationInfo }
  | { kind: 'upgrade' }
  | { kind: 'confirm-delete'; loc: BusinessLocationInfo }
  | { kind: 'blocked'; loc: BusinessLocationInfo; appointments: number }

export function LocationsPage({ session, business, onRefresh }: LocationsPageProps) {
  const isStaff = session.role === 'staff'
  const allowed = canAddLocation(business)
  const limit = locationLimitForPlan(business.plan)

  const [modal, setModal] = useState<ModalState>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState<DayHours[]>(defaultHours)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resetModal = () => {
    setModal(null)
    setName('')
    setDescription('')
    setHours(defaultHours())
    setError('')
    setLoading(false)
  }

  const openAdd = () => {
    if (!allowed) {
      setModal({ kind: 'upgrade' })
      return
    }
    setName('')
    setDescription('')
    setModal({ kind: 'add' })
  }

  const openEditName = (loc: BusinessLocationInfo) => {
    setName(loc.name)
    setDescription(loc.description)
    setModal({ kind: 'edit-name', loc })
  }

  const openEditHours = (loc: BusinessLocationInfo) => {
    setHours(loc.hours.length === 7 ? loc.hours : defaultHours())
    setModal({ kind: 'edit-hours', loc })
  }

  const openDelete = (loc: BusinessLocationInfo) => {
    const appointments = getAppointmentsForBusiness(business.id).filter((a) => a.locationId === loc.id).length
    if (appointments > 0) {
      setModal({ kind: 'blocked', loc, appointments })
      return
    }
    setModal({ kind: 'confirm-delete', loc })
  }

  const handleDelete = () => {
    if (!modal || modal.kind !== 'confirm-delete') return
    setLoading(true)
    window.setTimeout(() => {
      removeLocation(business.id, modal.loc.id)
      toast('تم حذف الموقع.')
      resetModal()
      setLoading(false)
      onRefresh()
    }, 400)
  }

  const toggleDay = (dayKey: string) => {
    setHours((prev) => prev.map((h) => (h.day === dayKey ? { ...h, closed: !h.closed } : h)))
    setError('')
  }

  const setTime = (dayKey: string, field: 'open' | 'close', value: string) => {
    setHours((prev) => prev.map((h) => (h.day === dayKey ? { ...h, [field]: value } : h)))
    setError('')
  }

  const validateHours = (): boolean => {
    for (const h of hours) {
      if (h.closed) continue
      if (!h.open || !h.close) {
        setError(`يرجى تحديد أوقات الفتح والإغلاق ليوم ${DAYS.find((d) => d.key === h.day)?.label}.`)
        return false
      }
      if (timeToMin(h.close) <= timeToMin(h.open)) {
        setError(`وقت الإغلاق يجب أن يكون بعد وقت الفتح ليوم ${DAYS.find((d) => d.key === h.day)?.label}.`)
        return false
      }
    }
    return true
  }

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim().length < 2) {
      setError('اسم الموقع يجب أن يكون حرفين على الأقل.')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      addLocation(business.id, {
        name: name.trim(),
        description: description.trim(),
        hours: defaultHours(),
      })
      toast('تمت إضافة الموقع.')
      resetModal()
      setLoading(false)
      onRefresh()
    }, 400)
  }

  const handleEditName = (e: FormEvent) => {
    e.preventDefault()
    if (!modal || modal.kind !== 'edit-name') return
    if (!name.trim() || name.trim().length < 2) {
      setError('اسم الموقع يجب أن يكون حرفين على الأقل.')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      updateLocation(business.id, modal.loc.id, {
        name: name.trim(),
        description: description.trim(),
      })
      toast('تم تحديث الموقع.')
      resetModal()
      setLoading(false)
      onRefresh()
    }, 400)
  }

  const handleSaveHours = () => {
    if (!modal || modal.kind !== 'edit-hours') return
    if (!validateHours()) return
    setLoading(true)
    window.setTimeout(() => {
      updateLocationHours(business.id, modal.loc.id, hours)
      toast('تم حفظ أوقات العمل.')
      resetModal()
      setLoading(false)
      onRefresh()
    }, 400)
  }

  return (
    <>
      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          {business.locations.length} {business.locations.length === 1 ? 'موقع' : 'مواقع'}
          {!isStaff && limit !== Infinity && (
            <span style={{ marginInlineStart: 4, fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
              ({limit} {limit === 1 ? 'حد أقصى' : 'حد أقصى'} — {business.plan.toUpperCase()})
            </span>
          )}
        </span>
        <div style={{ flex: 1 }} />
        {!isStaff && (
          <button className="dash-quick-btn primary" type="button" onClick={openAdd}>
            <Plus /> إضافة موقع
          </button>
        )}
      </div>

      {/* ── Add location modal ── */}
      {modal?.kind === 'add' && (
        <div className="dash-overlay open" onClick={resetModal}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '8vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><MapPin /> إضافة موقع</span>
              <button className="dash-section-action" type="button" onClick={resetModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleAdd} noValidate style={{ padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>اسم الموقع *</label>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (error) setError('') }} placeholder="مثال: الفرع الرئيسي" style={inputStyle(error)} />
                {error && <span style={errStyle}>{error}</span>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>وصف الموقع</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر..." rows={3} style={{ ...inputStyle(''), resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={loading} style={primaryBtnStyle}>
                  {loading ? <><Loader2 className="auth-spin" /> جارٍ الحفظ...</> : <><CheckCircle2 /> إضافة</>}
                </button>
                <button className="btn btn-secondary" type="button" onClick={resetModal} disabled={loading} style={secondaryBtnStyle}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit name modal ── */}
      {modal?.kind === 'edit-name' && (
        <div className="dash-overlay open" onClick={resetModal}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '8vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Pencil /> تعديل الموقع</span>
              <button className="dash-section-action" type="button" onClick={resetModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleEditName} noValidate style={{ padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>اسم الموقع *</label>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (error) setError('') }} style={inputStyle(error)} />
                {error && <span style={errStyle}>{error}</span>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>وصف الموقع</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle(''), resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={loading} style={primaryBtnStyle}>
                  {loading ? <><Loader2 className="auth-spin" /> جارٍ الحفظ...</> : <><CheckCircle2 /> حفظ</>}
                </button>
                <button className="btn btn-secondary" type="button" onClick={resetModal} disabled={loading} style={secondaryBtnStyle}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit hours modal ── */}
      {modal?.kind === 'edit-hours' && (
        <div className="dash-overlay open" onClick={resetModal}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 560, margin: '6vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Clock /> أوقات العمل — {modal.loc.name}</span>
              <button className="dash-section-action" type="button" onClick={resetModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div className="oh-grid">
                {DAYS.map((day) => {
                  const dayHours = hours.find((h) => h.day === day.key)
                  const isClosed = dayHours?.closed ?? false
                  return (
                    <div key={day.key} className={`oh-row${isClosed ? ' oh-row-closed' : ''}`}>
                      <span className="oh-day">{day.label}</span>
                      <button type="button" className={`oh-toggle${isClosed ? '' : ' on'}`} onClick={() => toggleDay(day.key)} />
                      {isClosed ? (
                        <span className="oh-closed">مغلق</span>
                      ) : (
                        <div className="oh-times">
                          <input type="time" className="oh-time" dir="ltr" value={dayHours?.open ?? '09:00'} onChange={(e) => setTime(day.key, 'open', e.target.value)} />
                          <span className="oh-sep">—</span>
                          <input type="time" className="oh-time" dir="ltr" value={dayHours?.close ?? '21:00'} onChange={(e) => setTime(day.key, 'close', e.target.value)} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {error && <div className="oh-error"><span className="field-err">{error}</span></div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="btn btn-primary" type="button" disabled={loading} onClick={handleSaveHours} style={primaryBtnStyle}>
                  {loading ? <><Loader2 className="auth-spin" /> جارٍ الحفظ...</> : <><CheckCircle2 /> حفظ</>}
                </button>
                <button className="btn btn-secondary" type="button" onClick={resetModal} disabled={loading} style={secondaryBtnStyle}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete modal ── */}
      {modal?.kind === 'confirm-delete' && (
        <div className="dash-overlay open" onClick={resetModal}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '12vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Trash2 /> حذف الموقع</span>
              <button className="dash-section-action" type="button" onClick={resetModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, margin: '0 0 20px' }}>
                هل أنت متأكد من حذف موقع <b style={{ color: 'var(--color-text-primary)' }}>{modal.loc.name}</b>؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="button" disabled={loading} style={{ ...primaryBtnStyle, background: 'var(--color-error)' }} onClick={handleDelete}>
                  {loading ? <><Loader2 className="auth-spin" /> جارٍ الحذف...</> : <><Trash2 /> نعم، احذف</>}
                </button>
                <button className="btn btn-secondary" type="button" onClick={resetModal} disabled={loading} style={secondaryBtnStyle}>تراجع</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Blocked delete modal ── */}
      {modal?.kind === 'blocked' && (
        <div className="dash-overlay open" onClick={resetModal}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 460, margin: '12vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><MapPin /> تعذّر الحذف</span>
              <button className="dash-section-action" type="button" onClick={resetModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div className="team-upgrade" style={{ marginBottom: 16 }}>
                <span className="team-upgrade-ic"><MapPin /></span>
                <div>
                  <h4>لا يمكن حذف هذا الموقع</h4>
                  <p>
                    يوجد <b>{(modal as { appointments: number }).appointments} موعد</b> مسجّلة في هذا الموقع.
                    يجب نقل أو حذف المواعيد قبل إزالة الموقع.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" type="button" onClick={resetModal} style={secondaryBtnStyle}>فهمت</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Upgrade modal ── */}
      {modal?.kind === 'upgrade' && (
        <div className="dash-overlay open" onClick={resetModal}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '12vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Crown /> ترقية الخطة</span>
              <button className="dash-section-action" type="button" onClick={resetModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 24, textAlign: 'center' }}>
              <span className="dash-stat-ic primary" style={{ margin: '0 auto 14px' }}><Crown /></span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px' }}>وصلت الحد الأقصى</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.7 }}>
                خطتك الحالية ({business.plan.toUpperCase()}) تسمح بموقع واحد فقط. قم بالترقية للحصول على مواقع إضافية.
              </p>
              <button className="btn btn-primary" type="button" onClick={() => { toast('الترقية قيد التطوير.'); resetModal() }} style={primaryBtnStyle}>
                <Crown /> ترقية الخطة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Locations list ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title"><MapPin /> المواقع</span>
        </div>
        <div className="dash-section-body">
          {business.locations.length === 0 ? (
            <div className="dash-empty">
              <span className="dash-empty-ic"><MapPin /></span>
              <p>لا توجد مواقع بعد.</p>
            </div>
          ) : (
            business.locations.map((loc) => (
              <div key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span className="dash-stat-ic primary"><MapPin /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{loc.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{hoursSummary(loc.hours)}</span>
                    {loc.description && (
                      <>
                        <span>·</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{loc.description}</span>
                      </>
                    )}
                  </div>
                </div>
                {!isStaff && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" title="تعديل الاسم" onClick={() => openEditName(loc)} style={iconBtnStyle}>
                      <Pencil />
                    </button>
                    <button type="button" title="أوقات العمل" onClick={() => openEditHours(loc)} style={iconBtnStyle}>
                      <Clock />
                    </button>
                    <button type="button" title="حذف الموقع" onClick={() => openDelete(loc)} style={{ ...iconBtnStyle, color: 'var(--color-error)' }}>
                      <Trash2 />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-secondary)' }
const inputStyle = (error: string): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-default)'}`,
  fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
})
const errStyle: React.CSSProperties = { display: 'block', marginTop: 4, fontSize: '0.78rem', color: 'var(--color-error)' }
const primaryBtnStyle: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const secondaryBtnStyle: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border-default)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--color-surface)' }
const iconBtnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border-default)', background: 'var(--color-surface)', color: 'var(--color-text-secondary)', cursor: 'pointer' }

export default LocationsPage
