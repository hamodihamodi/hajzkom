import { useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Crown, Loader2, MapPin } from 'lucide-react'
import { OnboardingShell } from './OnboardingShell'
import { getSession } from '../../utils/accounts'
import { addLocation, canAddLocation, getBusinessByOwner } from '../../utils/business'
import { toast } from '../../utils/toast'

export function CreateLocationPage() {
  const session = getSession()
  const business = session ? getBusinessByOwner(session.accountId) : null
  const allowed = business ? canAddLocation(business) : false

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!business) {
    window.location.hash = '#/onboarding'
    return null
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim().length < 2) {
      setError('اسم الموقع يجب أن يكون حرفين على الأقل.')
      return
    }
    if (!allowed) return

    setLoading(true)
    window.setTimeout(() => {
      addLocation(business.id, {
        name: name.trim(),
        description: description.trim(),
        hours: [],
      })
      setLoading(false)
      toast('تم إنشاء الموقع.')
      window.location.hash = '#/onboarding/hours'
    }, 600)
  }

  if (!allowed) {
    return (
      <OnboardingShell activeStep={1}>
        <div className="onboard-card">
          <div className="onboard-upgrade">
            <span className="onboard-upgrade-ic">
              <Crown />
            </span>
            <h3>وصلت الحد الأقصى</h3>
            <p>
              خطتك الحالية تسمح بموقع واحد فقط. قم بالترقية للحصول على مواقع إضافية.
            </p>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => toast('الترقية قيد التطوير.')}
            >
              <Crown /> ترقية الخطة
            </button>
          </div>
          <div className="onboard-actions">
            <a href="#/onboarding/hours" className="onboard-skip">
              تخطي والانتقال للأوقات <ArrowLeft />
            </a>
          </div>
        </div>
      </OnboardingShell>
    )
  }

  return (
    <OnboardingShell activeStep={1}>
      <div className="onboard-card">
        <h1 className="onboard-title">إنشاء موقع</h1>
        <p className="onboard-sub">
          أضف أول موقع لنشاطك. يمكنك إضافة مواقع لاحقاً من إعدادات لوحة التحكم.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="onboard-section">
            <div className="onboard-section-title">
              <MapPin /> معلومات الموقع
            </div>
            <div className="onboard-grid">
              <div className={`onboard-field${error ? ' has-error' : ''}`}>
                <label htmlFor="loc-name">اسم الموقع *</label>
                <input
                  id="loc-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="مثال: الفرع الرئيسي"
                />
                {error && <span className="field-err">{error}</span>}
              </div>
              <div className="onboard-field">
                <label htmlFor="loc-desc">وصف الموقع</label>
                <textarea
                  id="loc-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للموقع..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="onboard-actions">
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
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
            <a href="#/onboarding/hours" className="onboard-skip">
              تخطي هذه الخطوة <ArrowLeft />
            </a>
          </div>
        </form>
      </div>
    </OnboardingShell>
  )
}

export default CreateLocationPage
