import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, Eye, EyeOff, Info, Loader2, Mail, User } from 'lucide-react'
import { AuthShell } from './AuthShell'
import { signUp, attachInvitation, startSession } from '../../utils/accounts'
import { lookupInvitation, roleDisplay } from '../../utils/invites'
import { toast } from '../../utils/toast'

type Errors = { fullName?: string; email?: string; password?: string; confirm?: string }

interface SignupPageProps {
  invitationId?: string
}

export function SignupPage({ invitationId }: SignupPageProps) {
  const invitation = invitationId ? lookupInvitation(invitationId) : null
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [createdEmail, setCreatedEmail] = useState('')

  const validate = (): Errors => {
    const next: Errors = {}
    if (!fullName.trim()) next.fullName = 'يرجى إدخال الاسم الكامل.'
    else if (fullName.trim().length < 3) next.fullName = 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل.'
    if (!email.trim()) next.email = 'يرجى إدخال البريد الإلكتروني.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'صيغة البريد الإلكتروني غير صحيحة.'
    if (!password) next.password = 'يرجى إدخال كلمة المرور.'
    else if (password.length < 8) next.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.'
    if (!confirm) next.confirm = 'يرجى تأكيد كلمة المرور.'
    else if (confirm !== password) next.confirm = 'كلمتا المرور غير متطابقتين.'
    return next
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    window.setTimeout(() => {
      const result = signUp({
        fullName,
        email,
        password,
        role: invitation?.role,
        businessId: invitation?.businessId,
      })
      if (!result.ok) {
        setErrors({ email: result.error })
        setLoading(false)
        return
      }
      const account = result.value
      if (invitation) {
        attachInvitation(account.id, invitation.role, invitation.businessId)
        startSession(account)
      }
      setLoading(false)
      setDone(true)
      setCreatedEmail(email.trim())
      if (invitation) {
        window.location.hash = `#/accept-invite?invite=${invitation.id}`
        return
      }
      toast('تم إنشاء حسابك بنجاح.')
    }, 1100)
  }

  if (done) {
    if (invitation) return null
    return (
      <AuthShell
        title="تم إنشاء حسابك"
        subtitle="خطوة واحدة تفصلك عن تجهيز نشاطك."
        footer={
          <p>
            <a href="#/login" className="auth-link">
              تسجيل الدخول إلى حسابك <ArrowRight />
            </a>
          </p>
        }
      >
        <div className="auth-success">
          <span className="auth-suc-ic">
            <Check />
          </span>
          <p>
            حساب النشاط جاهز على <b dir="ltr">{createdEmail}</b>. سجّل الدخول الآن لبدء تجهيز خدماتك وأوقات عملك ومشاركة
            رابط الحجز مع زبائنك.
          </p>
          <a href="#/login" className="btn btn-primary btn-block">
            تسجيل الدخول الآن
          </a>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={invitation ? 'إنشاء حسابك' : 'إنشاء حساب نشاط'}
      subtitle={
        invitation
          ? `أنت مدعو للانضمام إلى ${invitation.businessName} كـ ${roleDisplay(invitation.role)}.`
          : 'حساب واحد لنشاطك. ستضيف لاحقاً مشرفين وموظفين من داخل اللوحة.'
      }
      footer={
        <p>
          لديك حساب بالفعل؟{' '}
          <a
            href={invitation ? `#/invite/${invitation.id}?login=1` : '#/login'}
            className="auth-link"
          >
            تسجيل الدخول
          </a>
        </p>
      }
    >
      {invitation && (
        <div className="info-box">
          <Info />
          <div>
            سيُحدد دورك تلقائياً من دعوتك: {roleDisplay(invitation.role)}
            {invitation.locationName ? ` في ${invitation.locationName}` : ''}. لن تحتاج لاختيار دور.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`field${errors.fullName ? ' has-error' : ''}`}>
          <label htmlFor="su-name">الاسم الكامل</label>
          <div className="auth-input-wrap">
            <User />
            <input
              id="su-name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (errors.fullName) setErrors((pre) => ({ ...pre, fullName: undefined }))
              }}
              placeholder="مثال: أحمد حسن"
              autoComplete="name"
            />
          </div>
          {errors.fullName && <span className="field-err">{errors.fullName}</span>}
        </div>

        <div className={`field${errors.email ? ' has-error' : ''}`}>
          <label htmlFor="su-email">البريد الإلكتروني</label>
          <div className="auth-input-wrap">
            <Mail />
            <input
              id="su-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((pre) => ({ ...pre, email: undefined }))
              }}
              placeholder="name@example.com"
              dir="ltr"
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="field-err">{errors.email}</span>}
        </div>

        <div className={`field${errors.password ? ' has-error' : ''}`}>
          <label htmlFor="su-pass">كلمة المرور</label>
          <div className="auth-input-wrap auth-input-pad">
            <input
              id="su-pass"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((pre) => ({ ...pre, password: undefined }))
              }}
              placeholder="8 أحرف على الأقل"
              dir="ltr"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-eye"
              aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              onClick={() => setShowPass((v) => !v)}
            >
              {showPass ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && <span className="field-err">{errors.password}</span>}
        </div>

        <div className={`field${errors.confirm ? ' has-error' : ''}`}>
          <label htmlFor="su-confirm">تأكيد كلمة المرور</label>
          <div className="auth-input-wrap auth-input-pad">
            <input
              id="su-confirm"
              type={showPass ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value)
                if (errors.confirm) setErrors((pre) => ({ ...pre, confirm: undefined }))
              }}
              placeholder="أعد إدخال كلمة المرور"
              dir="ltr"
              autoComplete="new-password"
            />
          </div>
          {errors.confirm && <span className="field-err">{errors.confirm}</span>}
        </div>

        <button className="btn btn-primary btn-block btn-lg auth-submit" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="auth-spin" /> جارٍ إنشاء الحساب...
            </>
          ) : (
            'إنشاء الحساب'
          )}
        </button>
      </form>
    </AuthShell>
  )
}

export default SignupPage
