import { useState, useRef, type FormEvent } from 'react'
import { ArrowRight, Building2, Check, CheckCircle2, ImagePlus, Loader2, Trash2, Upload, X } from 'lucide-react'
import { BrandIcon } from '../../components/marketing/BrandMark'
import { getSession } from '../../utils/accounts'
import { createBusiness, deleteBusiness, getBusinessByOwner, updateBusiness } from '../../utils/business'
import { toast } from '../../utils/toast'

const STEPS = [
  { key: 'business', label: 'النشاط' },
  { key: 'location', label: 'الموقع' },
  { key: 'hours', label: 'الأوقات' },
  { key: 'service', label: 'الخدمة' },
] as const

interface Errors {
  name?: string
  logo?: string
  cover?: string
}

function readDataUrl(file: File, maxBytes: number): Promise<string | null> {
  return new Promise((res) => {
    if (file.size > maxBytes) {
      res(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => res(reader.result as string)
    reader.onerror = () => res(null)
    reader.readAsDataURL(file)
  })
}

export function CreateBusinessPage() {
  const session = getSession()
  const existing = session ? getBusinessByOwner(session.accountId) : null

  const [name, setName] = useState(existing?.name ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [logoUrl, setLogoUrl] = useState<string | null>(existing?.logoDataUrl ?? null)
  const [coverUrl, setCoverUrl] = useState<string | null>(existing?.coverDataUrl ?? null)
  const [bookingDays, setBookingDays] = useState(existing?.bookingWindowDays ?? 30)
  const [whatsapp, setWhatsapp] = useState(existing?.whatsappNumber ?? '')
  const [telegram, setTelegram] = useState(existing?.telegramUsername ?? '')
  const [email, setEmail] = useState(existing?.contactEmail ?? '')
  const [facebook, setFacebook] = useState(existing?.facebookUrl ?? '')
  const [instagram, setInstagram] = useState(existing?.instagramUrl ?? '')
  const [tiktok, setTiktok] = useState(existing?.tiktokUrl ?? '')
  const [website, setWebsite] = useState(existing?.websiteUrl ?? '')

  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [delConfirm, setDelConfirm] = useState('')

  const logoRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  const handleLogo = async (file: File) => {
    const url = await readDataUrl(file, 200 * 1024)
    if (!url) {
      setErrors((p) => ({ ...p, logo: 'الحد الأقصى 200 كيلوبايت' }))
      return
    }
    setLogoUrl(url)
    setErrors((p) => ({ ...p, logo: undefined }))
  }

  const handleCover = async (file: File) => {
    const url = await readDataUrl(file, 500 * 1024)
    if (!url) {
      setErrors((p) => ({ ...p, cover: 'الحد الأقصى 500 كيلوبايت' }))
      return
    }
    setCoverUrl(url)
    setErrors((p) => ({ ...p, cover: undefined }))
  }

  const validate = (): Errors => {
    const next: Errors = {}
    if (!name.trim() || name.trim().length < 2) next.name = 'اسم النشاط يجب أن يكون حرفين على الأقل.'
    return next
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (!session) return

    setLoading(true)
    window.setTimeout(() => {
      if (existing) {
        updateBusiness(existing.id, {
          name: name.trim(),
          description: description.trim(),
          logoDataUrl: logoUrl,
          coverDataUrl: coverUrl,
          bookingWindowDays: bookingDays,
          whatsappNumber: whatsapp.trim(),
          telegramUsername: telegram.trim(),
          contactEmail: email.trim(),
          facebookUrl: facebook.trim(),
          instagramUrl: instagram.trim(),
          tiktokUrl: tiktok.trim(),
          websiteUrl: website.trim(),
        })
      } else {
        createBusiness({
          name: name.trim(),
          description: description.trim(),
          logoDataUrl: logoUrl,
          coverDataUrl: coverUrl,
          bookingWindowDays: bookingDays,
          whatsappNumber: whatsapp.trim(),
          telegramUsername: telegram.trim(),
          contactEmail: email.trim(),
          facebookUrl: facebook.trim(),
          instagramUrl: instagram.trim(),
          tiktokUrl: tiktok.trim(),
          websiteUrl: website.trim(),
          ownerId: session.accountId,
        })
      }
      setLoading(false)
      toast('تم حفظ معلومات النشاط.')
      window.location.hash = '#/onboarding/location'
    }, 800)
  }

  const handleDelete = () => {
    if (!existing || delConfirm.trim() !== existing.name.trim()) return
    deleteBusiness(existing.id)
    setShowDelete(false)
    toast('تم حذف النشاط.')
    window.location.hash = '#/login'
  }

  return (
    <div className="onboard-page">
      <header className="onboard-top">
        <a className="auth-brand" href="#/" aria-label="حجزكوم — الرئيسية">
          <BrandIcon size={34} />
          <span className="auth-brand-word">
            <b>حجز</b>كوم
          </span>
        </a>
        <a className="auth-back" href="#/">
          <ArrowRight /> العودة
        </a>
      </header>

      <div className="onboard-progress">
        <div className="onboard-steps">
          {STEPS.map((step, i) => (
            <div key={step.key} style={{ display: 'contents' }}>
              {i > 0 && <div className={`onboard-line${i <= 1 ? ' done' : ''}`} />}
              <div className={`onboard-step${i === 0 ? ' active' : ''}`}>
                <span className="onboard-dot">
                  {i < 1 ? step.key === 'business' && existing ? <Check /> : i + 1 : i + 1}
                </span>
                <span className="onboard-label">{step.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="onboard-main">
        <div className="onboard-card">
          <h1 className="onboard-title">{existing ? 'تعديل النشاط' : 'إنشاء نشاطك'}</h1>
          <p className="onboard-sub">
            {existing
              ? 'حدّث معلومات نشاطك.'
              : 'أضف معلومات نشاطك لتبدأ في استقبال الحجوزات.'}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Basic Info ── */}
            <div className="onboard-section">
              <div className="onboard-section-title">المعلومات الأساسية</div>
              <div className="onboard-grid">
                <div className={`onboard-field${errors.name ? ' has-error' : ''}`}>
                  <label htmlFor="ob-name">اسم النشاط *</label>
                  <input
                    id="ob-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }))
                    }}
                    placeholder="مثال: صالون لمسة جمال"
                  />
                  {errors.name && <span className="field-err">{errors.name}</span>}
                </div>
                <div className="onboard-field">
                  <label htmlFor="ob-desc">وصف النشاط</label>
                  <textarea
                    id="ob-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف مختصر لنشاطك..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* ── Media ── */}
            <div className="onboard-section">
              <div className="onboard-section-title">الصور</div>
              <div className="onboard-uploads">
                <div>
                  <label className="onboard-field" style={{ marginBottom: 6 }}>
                    الشعار
                  </label>
                  <div
                    className="onboard-upload"
                    onClick={() => logoRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && logoRef.current?.click()}
                  >
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleLogo(f)
                        e.target.value = ''
                      }}
                    />
                    {logoUrl ? (
                      <>
                        <div className="onboard-upload-preview">
                          <img src={logoUrl} alt="شعار النشاط" />
                        </div>
                        <button
                          type="button"
                          className="onboard-upload-remove"
                          onClick={(e) => {
                            e.stopPropagation()
                            setLogoUrl(null)
                          }}
                        >
                          <X />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="onboard-upload-ic">
                          <Upload />
                        </span>
                        <span className="onboard-upload-text">رفع شعار</span>
                        <span className="onboard-upload-hint">PNG, JPG (حد 200KB)</span>
                      </>
                    )}
                  </div>
                  {errors.logo && <span className="field-err">{errors.logo}</span>}
                </div>
                <div>
                  <label className="onboard-field" style={{ marginBottom: 6 }}>
                    صورة الغلاف
                  </label>
                  <div
                    className="onboard-upload is-cover"
                    onClick={() => coverRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && coverRef.current?.click()}
                  >
                    <input
                      ref={coverRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleCover(f)
                        e.target.value = ''
                      }}
                    />
                    {coverUrl ? (
                      <>
                        <div className="onboard-upload-preview">
                          <img src={coverUrl} alt="صورة الغلاف" />
                        </div>
                        <button
                          type="button"
                          className="onboard-upload-remove"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCoverUrl(null)
                          }}
                        >
                          <X />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="onboard-upload-ic">
                          <ImagePlus />
                        </span>
                        <span className="onboard-upload-text">رفع غلاف</span>
                        <span className="onboard-upload-hint">PNG, JPG (حد 500KB)</span>
                      </>
                    )}
                  </div>
                  {errors.cover && <span className="field-err">{errors.cover}</span>}
                </div>
              </div>
            </div>

            {/* ── Booking window ── */}
            <div className="onboard-section">
              <div className="onboard-section-title">إعدادات الحجز</div>
              <div className="onboard-field">
                <label htmlFor="ob-window">نافذة الحجز ({bookingDays} يوم)</label>
                <div className="onboard-slider-row">
                  <span className="onboard-slider-val">{bookingDays} يوم</span>
                  <input
                    id="ob-window"
                    className="onboard-slider"
                    type="range"
                    min={7}
                    max={120}
                    value={bookingDays}
                    onChange={(e) => setBookingDays(Number(e.target.value))}
                  />
                </div>
                <div className="onboard-slider-labels">
                  <span>٧ أيام</span>
                  <span>١٢٠ يوم</span>
                </div>
              </div>
            </div>

            {/* ── Contact ── */}
            <div className="onboard-section">
              <div className="onboard-section-title">معلومات الاتصال</div>
              <div className="onboard-grid">
                <div className="onboard-field">
                  <label htmlFor="ob-wa">رقم الواتساب</label>
                  <div className="onboard-field-icon">
                    <input
                      id="ob-wa"
                      type="tel"
                      dir="ltr"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+964 7XX XXX XXXX"
                    />
                    <span className="onboard-fi">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.627.616l4.584-1.195A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.82-6.293-2.192l-.44-.357-2.694.705.718-2.628-.36-.454A9.965 9.965 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="onboard-field">
                  <label htmlFor="ob-tg">مستخدم تيليقرام</label>
                  <div className="onboard-field-icon">
                    <input
                      id="ob-tg"
                      type="text"
                      dir="ltr"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="@username"
                    />
                    <span className="onboard-fi">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="onboard-field onboard-span-full">
                  <label htmlFor="ob-email">البريد الإلكتروني</label>
                  <input
                    id="ob-email"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@business.com"
                  />
                </div>
              </div>
            </div>

            {/* ── Social ── */}
            <div className="onboard-section">
              <div className="onboard-section-title">روابط التواصل الاجتماعي</div>
              <div className="onboard-grid">
                <div className="onboard-field">
                  <label htmlFor="ob-fb">فيسبوك</label>
                  <input
                    id="ob-fb"
                    type="url"
                    dir="ltr"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="onboard-field">
                  <label htmlFor="ob-ig">انستغرام</label>
                  <input
                    id="ob-ig"
                    type="url"
                    dir="ltr"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="onboard-field">
                  <label htmlFor="ob-tk">تيك توك</label>
                  <input
                    id="ob-tk"
                    type="url"
                    dir="ltr"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/..."
                  />
                </div>
                <div className="onboard-field">
                  <label htmlFor="ob-web">الموقع الإلكتروني</label>
                  <input
                    id="ob-web"
                    type="url"
                    dir="ltr"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="onboard-actions">
              <button
                className="btn btn-primary btn-block btn-lg"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="auth-spin" /> جارٍ الحفظ...
                  </>
                ) : (
                  <>
                    <CheckCircle2 /> استمرار
                  </>
                )}
              </button>
              <a href="#/dashboard" className="onboard-skip">
                تخطي هذه الخطوة <ArrowRight />
              </a>
            </div>
          </form>

          {/* ── Delete (edit mode only) ── */}
          {existing && (
            <div className="onboard-danger">
              <div className="onboard-danger-title">حذف النشاط</div>
              <div className="onboard-danger-desc">
                سيؤدي حذف النشاط إلى حذف جميع البيانات المرتبطة به بشكل نهائي ولا يمكن التراجع عن
                هذا الإجراء.
              </div>
              <button
                className="btn btn-danger btn-block"
                type="button"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 /> حذف النشاط
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="auth-bottom">
        <span>
          <Building2 /> حسابات حجزكوم لفريق النشاط فقط.
        </span>
        <span>© {new Date().getFullYear()} حجزكوم</span>
      </footer>

      {/* ── Delete confirmation modal ── */}
      {showDelete && existing && (
        <div className="onboard-del-modal">
          <div className="onboard-del-backdrop" onClick={() => setShowDelete(false)} />
          <div className="onboard-del-card">
            <h2>حذف النشاط</h2>
            <p>
              اكتب اسم النشاط <strong>{existing.name}</strong> للتأكيد.
            </p>
            <div className="onboard-field">
              <input
                type="text"
                dir="ltr"
                value={delConfirm}
                onChange={(e) => setDelConfirm(e.target.value)}
                placeholder={existing.name}
              />
            </div>
            <div className="onboard-del-actions">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setShowDelete(false)
                  setDelConfirm('')
                }}
              >
                إلغاء
              </button>
              <button
                className="btn btn-danger"
                type="button"
                disabled={delConfirm.trim() !== existing.name.trim()}
                onClick={handleDelete}
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateBusinessPage
