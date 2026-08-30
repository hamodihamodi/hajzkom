import { useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Loader2,
  Mail,
  MessageCircle,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from '../../utils/toast'
import type { Session } from '../../utils/accounts'
import { clearSession } from '../../utils/accounts'
import type { Business } from '../../utils/business'
import { updateBusiness, deleteBusiness } from '../../utils/business'

const LOGO_LIMIT = 200 * 1024
const COVER_LIMIT = 500 * 1024

function readDataUrl(file: File, limit: number): Promise<string | null> {
  return new Promise((resolve) => {
    if (file.size > limit) {
      resolve(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

interface BusinessSettingsPageProps {
  session: Session
  business: Business
  onRefresh: () => void
}

export function BusinessSettingsPage({ session, business, onRefresh }: BusinessSettingsPageProps) {
  const isOwner = session.role === 'owner'

  const [name, setName] = useState(business.name)
  const [description, setDescription] = useState(business.description)
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(business.logoDataUrl)
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(business.coverDataUrl)
  const [bookingWindowDays, setBookingWindowDays] = useState(business.bookingWindowDays)
  const [whatsappNumber, setWhatsappNumber] = useState(business.whatsappNumber)
  const [telegramUsername, setTelegramUsername] = useState(business.telegramUsername)
  const [contactEmail, setContactEmail] = useState(business.contactEmail)
  const [facebookUrl, setFacebookUrl] = useState(business.facebookUrl)
  const [instagramUrl, setInstagramUrl] = useState(business.instagramUrl)
  const [tiktokUrl, setTiktokUrl] = useState(business.tiktokUrl)
  const [websiteUrl, setWebsiteUrl] = useState(business.websiteUrl)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const data = await readDataUrl(file, LOGO_LIMIT)
    if (!data) {
      toast('حجم الشعار يتجاوز 200 كيلوبايت.')
      return
    }
    setLogoDataUrl(data)
  }

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const data = await readDataUrl(file, COVER_LIMIT)
    if (!data) {
      toast('حجم الصورة يتجاوز 500 كيلوبايت.')
      return
    }
    setCoverDataUrl(data)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim().length < 2) {
      setError('اسم النشاط يجب أن يكون حرفين على الأقل.')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      updateBusiness(business.id, {
        name: name.trim(),
        description: description.trim(),
        logoDataUrl,
        coverDataUrl,
        bookingWindowDays,
        whatsappNumber: whatsappNumber.trim(),
        telegramUsername: telegramUsername.trim(),
        contactEmail: contactEmail.trim(),
        facebookUrl: facebookUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        tiktokUrl: tiktokUrl.trim(),
        websiteUrl: websiteUrl.trim(),
      })
      toast('تم حفظ الإعدادات.')
      setLoading(false)
      onRefresh()
    }, 500)
  }

  const handleDelete = () => {
    if (deleteConfirm !== business.name) return
    setDeleting(true)
    window.setTimeout(() => {
      deleteBusiness(business.id)
      clearSession()
      toast('تم حذف النشاط.')
      window.location.hash = '#/'
      setDeleting(false)
    }, 600)
  }

  const inputS: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--color-border-default)',
    fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }
  const labelS: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-secondary)' }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        {/* ── Basic info ── */}
        <div className="dash-section" style={{ marginBottom: 20 }}>
          <div className="dash-section-head">
            <span className="dash-section-title"><Settings /> معلومات النشاط</span>
          </div>
          <div style={{ padding: 20, display: 'grid', gap: 14 }}>
            <div>
              <label style={labelS}>اسم النشاط *</label>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (error) setError('') }} style={{ ...inputS, borderColor: error ? 'var(--color-error)' : undefined }} />
              {error && <span style={{ display: 'block', marginTop: 4, fontSize: '0.78rem', color: 'var(--color-error)' }}>{error}</span>}
            </div>
            <div>
              <label style={labelS}>وصف النشاط</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputS, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelS}>الشعار</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {logoDataUrl && <img src={logoDataUrl} alt="شعار" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                  <label style={{ ...inputS, cursor: 'pointer', textAlign: 'center', padding: '8px 12px' }}>
                    اختر ملف
                    <input type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div>
                <label style={labelS}>صورة الغلاف</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {coverDataUrl && <img src={coverDataUrl} alt="غلاف" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                  <label style={{ ...inputS, cursor: 'pointer', textAlign: 'center', padding: '8px 12px' }}>
                    اختر ملف
                    <input type="file" accept="image/*" onChange={handleCover} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label style={labelS}>نافذة الحجز ({bookingWindowDays} يوم)</label>
              <input
                type="range" min={7} max={120} step={1}
                value={bookingWindowDays}
                onChange={(e) => setBookingWindowDays(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                <span>7 أيام</span>
                <span>120 يوم</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="dash-section" style={{ marginBottom: 20 }}>
          <div className="dash-section-head">
            <span className="dash-section-title"><Mail /> معلومات التواصل</span>
          </div>
          <div style={{ padding: 20, display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelS}><MessageCircle /> واتساب</label>
                <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+964..." style={inputS} />
              </div>
              <div>
                <label style={labelS}><MessageCircle /> تيليجرام</label>
                <input type="text" value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value)} placeholder="@username" style={inputS} />
              </div>
            </div>
            <div>
              <label style={labelS}><Mail /> البريد الإلكتروني</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com" style={inputS} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelS}>فيسبوك</label>
                <input type="url" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://..." style={inputS} />
              </div>
              <div>
                <label style={labelS}>انستغرام</label>
                <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://..." style={inputS} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelS}>تيك توك</label>
                <input type="url" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://..." style={inputS} />
              </div>
              <div>
                <label style={labelS}><Globe /> الموقع الإلكتروني</label>
                <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." style={inputS} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Save ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 24px', borderRadius: 10, border: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {loading ? <><Loader2 className="auth-spin" /> جارٍ الحفظ...</> : <><CheckCircle2 /> حفظ</>}
          </button>
        </div>
      </form>

      {/* ── Delete business ── */}
      {isOwner && (
        <div className="dash-section" style={{ marginBottom: 24, borderColor: 'var(--color-error)' }}>
          <div className="dash-section-head" style={{ borderBottomColor: 'var(--color-error-background)' }}>
            <span className="dash-section-title" style={{ color: 'var(--color-error)' }}><AlertTriangle /> منطقة الخطر</span>
          </div>
          <div style={{ padding: 20 }}>
            <p style={{ margin: '0 0 14px', color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              حذف النشاط سيمسح جميع البيانات نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </p>
            <button
              type="button"
              className="dash-quick-btn"
              onClick={() => { setShowDelete(true); setDeleteConfirm('') }}
              style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            >
              <Trash2 /> حذف النشاط
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {showDelete && (
        <div className="dash-overlay open" onClick={() => setShowDelete(false)}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '12vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head" style={{ borderBottomColor: 'var(--color-error-background)' }}>
              <span className="dash-section-title" style={{ color: 'var(--color-error)' }}><Trash2 /> حذف النشاط</span>
              <button className="dash-section-action" type="button" onClick={() => setShowDelete(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ margin: '0 0 14px', color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                اكتب اسم النشاط "<strong>{business.name}</strong>" للتأكيد:
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={business.name}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${deleteConfirm === business.name ? 'var(--color-error)' : 'var(--color-border-default)'}`, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  disabled={deleteConfirm !== business.name || deleting}
                  onClick={handleDelete}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 10, border: 'none', fontSize: '0.88rem', fontWeight: 600,
                    cursor: deleteConfirm === business.name ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                    background: deleteConfirm === business.name ? 'var(--color-error)' : 'var(--color-surface-muted)',
                    color: deleteConfirm === business.name ? '#fff' : 'var(--color-text-disabled)',
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? <><Loader2 className="auth-spin" /> جارٍ الحذف...</> : <><Trash2 /> حذف نهائي</>}
                </button>
                <button type="button" onClick={() => setShowDelete(false)} disabled={deleting} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border-default)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--color-surface)' }}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BusinessSettingsPage
