import { useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, Scissors } from 'lucide-react'
import { OnboardingShell } from './OnboardingShell'
import { getSession } from '../../utils/accounts'
import { addService, getBusinessByOwner } from '../../utils/business'
import { toast } from '../../utils/toast'

const DURATIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90, 120]

function durationLabel(min: number): string {
  if (min < 60) return `${min} دقيقة`
  const h = min / 60
  if (h === Math.floor(h)) return `${h} ساعة`
  return `${min} دقيقة`
}

export function AddFirstServicePage() {
  const session = getSession()
  const business = session ? getBusinessByOwner(session.accountId) : null

  const [name, setName] = useState('')
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!business) {
    window.location.hash = '#/onboarding'
    return null
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim().length < 2) {
      setError('اسم الخدمة يجب أن يكون حرفين على الأقل.')
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      addService(business.id, {
        name: name.trim(),
        durationMin: duration,
      })
      setLoading(false)
      toast('تمت إضافة الخدمة. أنت الآن جاهز للعمل!')
      window.location.hash = '#/dashboard'
    }, 600)
  }

  return (
    <OnboardingShell activeStep={3}>
      <div className="onboard-card">
        <h1 className="onboard-title">أضف خدمة</h1>
        <p className="onboard-sub">أضف أول خدمة لنشاطك. يمكنك إضافة المزيد لاحقاً.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="onboard-section">
            <div className="onboard-section-title">
              <Scissors /> معلومات الخدمة
            </div>
            <div className="onboard-grid">
              <div className={`onboard-field${error ? ' has-error' : ''}`}>
                <label htmlFor="svc-name">اسم الخدمة *</label>
                <input
                  id="svc-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="مثال: قص شعر"
                />
                {error && <span className="field-err">{error}</span>}
              </div>
              <div className="onboard-field">
                <label htmlFor="svc-dur">المدة (بالدقائق)</label>
                <select
                  id="svc-dur"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {durationLabel(d)}
                    </option>
                  ))}
                </select>
                <span className="onboard-hint">اختر مدة مناسبة للخدمة</span>
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
                  <CheckCircle2 /> إنهاء التجهيز والانتقال للوحة التحكم
                </>
              )}
            </button>
            <a href="#/dashboard" className="onboard-skip">
              تخطي والانتقال للوحة التحكم <ArrowLeft />
            </a>
          </div>
        </form>
      </div>
    </OnboardingShell>
  )
}

export default AddFirstServicePage
