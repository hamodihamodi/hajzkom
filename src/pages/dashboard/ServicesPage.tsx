import { useState, type FormEvent } from 'react'
import {
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Scissors,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from '../../utils/toast'
import type { Session } from '../../utils/accounts'
import type { Business } from '../../utils/business'
import {
  addService,
  updateService,
  deleteService,
} from '../../utils/business'
import type { ServiceInfo } from '../../types'

const DURATIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 120]

function durationLabel(min: number): string {
  if (min < 60) return `${min} دقيقة`
  const h = min / 60
  if (h === Math.floor(h)) return `${h} ساعة`
  return `${min} دقيقة`
}

interface ServicesPageProps {
  session: Session
  business: Business
  onRefresh: () => void
}

export function ServicesPage({ session, business, onRefresh }: ServicesPageProps) {
  const isStaff = session.role === 'staff'
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ServiceInfo | null>(null)
  const [deleting, setDeleting] = useState(false)

  const resetForm = () => {
    setName('')
    setDuration(30)
    setError('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (svc: ServiceInfo) => {
    setEditingId(svc.id)
    setName(svc.name)
    setDuration(svc.durationMin)
    setShowForm(true)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim().length < 2) {
      setError('اسم الخدمة يجب أن يكون حرفين على الأقل.')
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      if (editingId) {
        updateService(business.id, editingId, {
          name: name.trim(),
          durationMin: duration,
        })
        toast('تم تحديث الخدمة.')
      } else {
        addService(business.id, {
          name: name.trim(),
          durationMin: duration,
        })
        toast('تمت إضافة الخدمة.')
      }
      resetForm()
      setLoading(false)
      onRefresh()
    }, 400)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setDeleting(true)
    window.setTimeout(() => {
      deleteService(business.id, deleteTarget.id)
      toast('تم حذف الخدمة.')
      setDeleteTarget(null)
      setDeleting(false)
      onRefresh()
    }, 400)
  }

  return (
    <>
      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          {business.services.length} {business.services.length === 1 ? 'خدمة' : 'خدمات'}
        </span>
        <div style={{ flex: 1 }} />
        {!isStaff && (
          <button
            className="dash-quick-btn primary"
            type="button"
            onClick={() => { resetForm(); setShowForm(true) }}
          >
            <Plus /> إضافة خدمة
          </button>
        )}
      </div>

      {/* ── Service form modal ── */}
      {showForm && (
        <div className="dash-overlay open" onClick={resetForm}>
          <div
            className="dash-section"
            style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '8vh auto', cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dash-section-head">
              <span className="dash-section-title">
                <Scissors /> {editingId ? 'تعديل الخدمة' : 'إضافة خدمة'}
              </span>
              <button
                className="dash-section-action"
                type="button"
                onClick={resetForm}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmit} noValidate style={{ padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                  اسم الخدمة *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (error) setError('') }}
                  placeholder="مثال: قص شعر"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-default)'}`,
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {error && (
                  <span style={{ display: 'block', marginTop: 4, fontSize: '0.78rem', color: 'var(--color-error)' }}>
                    {error}
                  </span>
                )}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-secondary)' }}>
                  المدة (بالدقائق)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--color-border-default)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{durationLabel(d)}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {loading ? (
                    <><Loader2 className="auth-spin" /> جارٍ الحفظ...</>
                  ) : (
                    <><CheckCircle2 /> {editingId ? 'تحديث' : 'إضافة'}</>
                  )}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border-default)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--color-surface)' }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="dash-overlay open" onClick={() => setDeleteTarget(null)}>
          <div
            className="dash-section"
            style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '12vh auto', cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dash-section-head">
              <span className="dash-section-title">
                <Trash2 /> حذف الخدمة
              </span>
              <button
                className="dash-section-action"
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ margin: '0 0 20px', color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                هل أنت متأكد من حذف خدمة "<strong>{deleteTarget.name}</strong>"؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: 'var(--color-error)',
                    color: '#fff',
                  }}
                >
                  {deleting ? <><Loader2 className="auth-spin" /> جارٍ الحذف...</> : <><Trash2 /> حذف</>}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: '1px solid var(--color-border-default)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: 'var(--color-surface)',
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Services list ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title">
            <Scissors /> الخدمات
          </span>
        </div>
        <div className="dash-section-body">
          {business.services.length === 0 ? (
            <div className="dash-empty">
              <span className="dash-empty-ic"><Scissors /></span>
              <p>لا توجد خدمات بعد.</p>
            </div>
          ) : (
            business.services.map((svc) => (
              <div
                key={svc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <span className="dash-stat-ic primary">
                  <Scissors />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{svc.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    {durationLabel(svc.durationMin)}
                  </div>
                </div>
                {!isStaff && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      title="تعديل"
                      onClick={() => handleEdit(svc)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: '1px solid var(--color-border-default)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      <Pencil />
                    </button>
                    <button
                      type="button"
                      title="حذف"
                      onClick={() => setDeleteTarget(svc)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: '1px solid var(--color-border-default)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-error)',
                        cursor: 'pointer',
                      }}
                    >
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

export default ServicesPage
