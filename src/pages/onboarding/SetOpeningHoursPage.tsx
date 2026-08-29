import { useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { OnboardingShell } from './OnboardingShell'
import { getSession } from '../../utils/accounts'
import { getBusinessByOwner, updateLocationHours } from '../../utils/business'
import { toast } from '../../utils/toast'
import type { DayHours } from '../../types'

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

export function SetOpeningHoursPage() {
  const session = getSession()
  const business = session ? getBusinessByOwner(session.accountId) : null
  const location = business?.locations[0]

  const [hours, setHours] = useState<DayHours[]>(() => {
    if (location && location.hours.length === 7) return location.hours
    return defaultHours()
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!business) {
    window.location.hash = '#/onboarding'
    return null
  }

  if (!location) {
    window.location.hash = '#/onboarding/location'
    return null
  }

  const toggleDay = (dayKey: string) => {
    setHours((prev) =>
      prev.map((h) => (h.day === dayKey ? { ...h, closed: !h.closed } : h))
    )
    setError('')
  }

  const setTime = (dayKey: string, field: 'open' | 'close', value: string) => {
    setHours((prev) => prev.map((h) => (h.day === dayKey ? { ...h, [field]: value } : h)))
    setError('')
  }

  const validate = (): boolean => {
    for (const h of hours) {
      if (h.closed) continue
      if (!h.open || !h.close) {
        setError(
          `يرجى تحديد أوقات الفتح والإغلاق ليوم ${DAYS.find((d) => d.key === h.day)?.label}.`
        )
        return false
      }
      if (timeToMin(h.close) <= timeToMin(h.open)) {
        setError(
          `وقت الإغلاق يجب أن يكون بعد وقت الفتح ليوم ${DAYS.find((d) => d.key === h.day)?.label}.`
        )
        return false
      }
    }
    return true
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    window.setTimeout(() => {
      updateLocationHours(business.id, location.id, hours)
      setLoading(false)
      toast('تم حفظ أوقات العمل.')
      window.location.hash = '#/onboarding/service'
    }, 600)
  }

  return (
    <OnboardingShell activeStep={2}>
      <div className="onboard-card">
        <h1 className="onboard-title">أوقات العمل</h1>
        <p className="onboard-sub">حدد ساعات العمل لكل يوم في الأسبوع.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="onboard-section">
            <div className="onboard-section-title">
              <Clock /> الجدول الأسبوعي
            </div>

            <div className="oh-grid">
              {DAYS.map((day) => {
                const dayHours = hours.find((h) => h.day === day.key)
                const isClosed = dayHours?.closed ?? false
                return (
                  <div key={day.key} className={`oh-row${isClosed ? ' oh-row-closed' : ''}`}>
                    <span className="oh-day">{day.label}</span>
                    <button
                      type="button"
                      className={`oh-toggle${isClosed ? '' : ' on'}`}
                      onClick={() => toggleDay(day.key)}
                      aria-label={isClosed ? `فتح ${day.label}` : `إغلاق ${day.label}`}
                    />
                    {isClosed ? (
                      <span className="oh-closed">مغلق</span>
                    ) : (
                      <div className="oh-times">
                        <input
                          type="time"
                          className="oh-time"
                          dir="ltr"
                          value={dayHours?.open ?? '09:00'}
                          onChange={(e) => setTime(day.key, 'open', e.target.value)}
                        />
                        <span className="oh-sep">—</span>
                        <input
                          type="time"
                          className="oh-time"
                          dir="ltr"
                          value={dayHours?.close ?? '21:00'}
                          onChange={(e) => setTime(day.key, 'close', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {error && (
              <div className="oh-error">
                <span className="field-err">{error}</span>
              </div>
            )}
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
            <a href="#/onboarding/service" className="onboard-skip">
              تخطي هذه الخطوة <ArrowLeft />
            </a>
          </div>
        </form>
      </div>
    </OnboardingShell>
  )
}

export default SetOpeningHoursPage
