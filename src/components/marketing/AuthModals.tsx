import { useEffect, useState, type FormEvent } from 'react'
import { Check, Info, Star, X } from 'lucide-react'
import { subscribeToAuthModal } from '../../utils/authModal'
import { toast, toastSoon } from '../../utils/toast'

type Mode = 'login' | 'signup' | null

export function AuthModals() {
  const [mode, setMode] = useState<Mode>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  useEffect(() => {
    return subscribeToAuthModal((detail) => {
      setLoginLoading(false)
      setSignupLoading(false)
      setSignupDone(false)
      setPlan(detail.mode === 'signup' && detail.plan ? detail.plan : null)
      setMode(detail.mode)
    })
  }, [])

  useEffect(() => {
    document.body.style.overflow = mode !== null ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mode])

  useEffect(() => {
    if (mode === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMode(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode])

  const close = () => setMode(null)

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginLoading(true)
    window.setTimeout(() => {
      setLoginLoading(false)
      setMode(null)
      toast('أهلاً بعودتك! هذه معاينة تفاعلية للواجهة.')
    }, 1200)
  }

  const handleSignupSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSignupLoading(true)
    window.setTimeout(() => {
      setSignupLoading(false)
      setSignupDone(true)
      toast('تم إنشاء حساب نشاطك بنجاح.')
    }, 1400)
  }

  return (
    <>
      <div className={`modal${mode === 'login' ? ' open' : ''}`} aria-hidden={mode !== 'login'}>
        <div className="modal-backdrop" onClick={close} />
        <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
          <button className="modal-close" type="button" aria-label="إغلاق" onClick={close}>
            <X />
          </button>
          <h3 id="loginTitle">تسجيل الدخول</h3>
          <p className="modal-sub">حسابات حجزكوم مخصصة لصاحب النشاط وفريقه فقط: مالك، مشرف، أو موظف.</p>
          <div className="info-box">
            <Info />
            <div>
              هل أنت زبون وتريد الحجز؟ <b>لا تحتاج حساباً</b> — استخدم رابط الحجز الذي شاركه معك النشاط.
            </div>
          </div>
          <form onSubmit={handleLoginSubmit}>
            <div className="field">
              <label htmlFor="loginId">البريد الإلكتروني أو رقم الهاتف</label>
              <input id="loginId" type="text" required placeholder="0770 000 0000" />
            </div>
            <div className="field">
              <label htmlFor="loginPass">كلمة المرور</label>
              <input id="loginPass" type="password" required placeholder="••••••••" />
            </div>
            <div className="form-foot">
              <button type="button" className="modal-link" onClick={toastSoon}>
                نسيت كلمة المرور؟
              </button>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loginLoading}>
              {loginLoading ? (
                <>
                  <span className="spin" /> جاري التحقق...
                </>
              ) : (
                'دخول'
              )}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '.85rem', marginTop: 18 }}>
            ليس لديك حساب؟{' '}
            <button
              type="button"
              className="modal-link"
              onClick={() => {
                setPlan(null)
                setSignupDone(false)
                setMode('signup')
              }}
            >
              أنشئ حساب نشاطك
            </button>
          </p>
        </div>
      </div>

      <div className={`modal${mode === 'signup' ? ' open' : ''}`} aria-hidden={mode !== 'signup'}>
        <div className="modal-backdrop" onClick={close} />
        <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="signupTitle">
          <button className="modal-close" type="button" aria-label="إغلاق" onClick={close}>
            <X />
          </button>
          <h3 id="signupTitle">إنشاء حساب نشاط</h3>
          <p className="modal-sub">حساب واحد لنشاطك — تضيف إليه فريقك (مشرفين وموظفين) من داخل اللوحة لاحقاً.</p>
          {plan !== null && !signupDone && (
            <div className="plan-chip">
              <Star />
              <span>الخطة المختارة: {plan}</span>
            </div>
          )}
          {!signupDone ? (
            <form onSubmit={handleSignupSubmit}>
              <div className="field">
                <label htmlFor="suBiz">اسم النشاط</label>
                <input id="suBiz" type="text" required placeholder="مثال: صالون لمسة" />
              </div>
              <div className="field">
                <label htmlFor="suType">نوع النشاط</label>
                <select id="suType" required defaultValue="salon">
                  <option value="salon">صالون تجميل</option>
                  <option value="barber">صالون حلاقة</option>
                  <option value="clinic">عيادة</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="suName">اسمك الكامل</label>
                <input id="suName" type="text" required placeholder="الاسم" />
              </div>
              <div className="field">
                <label htmlFor="suPhone">رقم الواتساب</label>
                <input
                  id="suPhone"
                  type="tel"
                  required
                  placeholder="07XX XXX XXXX"
                  dir="ltr"
                  style={{ textAlign: 'end' }}
                />
              </div>
              <div className="field">
                <label htmlFor="suPass">كلمة المرور</label>
                <input id="suPass" type="password" required minLength={8} placeholder="8 أحرف على الأقل" />
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={signupLoading}>
                {signupLoading ? (
                  <>
                    <span className="spin" /> جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء الحساب'
                )}
              </button>
            </form>
          ) : (
            <div className="suc-view">
              <div className="suc-ic">
                <Check />
              </div>
              <h4>تم إنشاء حساب نشاطك</h4>
              <p>
                أرسلنا رابط التفعيل إلى رقم الواتساب الذي أدخلته. بعد التفعيل، جهّز خدماتك وأوقاتك وشارك رابط الحجز — كله
                خلال دقائق.
              </p>
              <button className="btn btn-primary btn-block" type="button" onClick={close}>
                تم، فهمت
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AuthModals
