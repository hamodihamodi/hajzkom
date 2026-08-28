import { useState, type FormEvent } from 'react'
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2, Mail, Shield } from 'lucide-react'
import { AuthShell } from './AuthShell'
import {
  login,
  reactivateAccount,
  resolveDashboard,
  startSession,
  getSession,
  type AccountRole,
} from '../../utils/accounts'
import { lookupInvitation, isInviteValid } from '../../utils/invites'
import { toast } from '../../utils/toast'

type Errors = { email?: string; password?: string }

type ReactivateState =
  | { phase: 'ask'; email: string }
  | { phase: 'confirming' }
  | { phase: 'done' }

interface LoginPageProps {
  invitationId?: string
}

export function LoginPage({ invitationId }: LoginPageProps) {
  const invitation = invitationId ? lookupInvitation(invitationId) : null
  const inviteValid = invitation ? isInviteValid(invitation) : false
  const initialEmail = getSession()?.email ?? ''
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reactivate, setReactivate] = useState<ReactivateState | null>(null)

  const validate = (): Errors => {
    const next: Errors = {}
    if (!email.trim()) next.email = 'يرجى إدخال البريد الإلكتروني.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'صيغة البريد الإلكتروني غير صحيحة.'
    if (!password) next.password = 'يرجى إدخال كلمة المرور.'
    return next
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    window.setTimeout(() => {
      const result = login(email, password)
      setLoading(false)

      if (!result.ok) {
        if (result.needsReactivation) {
          setReactivate({ phase: 'ask', email: email.trim() })
          return
        }
        const err: Errors = {}
        if (result.error.includes('بريد')) err.email = result.error
        else err.password = result.error
        setErrors(err)
        setPassword('')
        return
      }

      const account = result.value
      startSession(account)
      if (inviteValid && invitation) {
        window.location.hash = `#/accept-invite?invite=${invitation.id}`
        return
      }
      window.location.hash = resolveDashboard(account.role as AccountRole)
      toast(`أهلاً بعودتك يا ${account.fullName.split(' ')[0]}!`)
    }, 1200)
  }

  const handleReactivate = () => {
    if (!reactivate || reactivate.phase !== 'ask') return
    setReactivate({ phase: 'confirming' })
    window.setTimeout(() => {
      const result = reactivateAccount(reactivate.email)
      setReactivate({ phase: 'done' })
      if (!result.ok) {
        toast(result.error, false)
        return
      }
      toast('تمت إعادة تفعيل حسابك. سجّل الدخول الآن.')
    }, 1100)
  }

  const renderMain = () => (
    <form onSubmit={handleSubmit} noValidate>
      <div className={`field${errors.email ? ' has-error' : ''}`}>
        <label htmlFor="li-email">البريد الإلكتروني</label>
        <div className="auth-input-wrap">
          <Mail />
          <input
            id="li-email"
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
        <label htmlFor="li-pass">كلمة المرور</label>
        <div className="auth-input-wrap auth-input-pad">
          <input
            id="li-pass"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((pre) => ({ ...pre, password: undefined }))
            }}
            placeholder="••••••••"
            dir="ltr"
            autoComplete="current-password"
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

      <button className="btn btn-primary btn-block btn-lg auth-submit" type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="auth-spin" /> جارٍ تسجيل الدخول...
          </>
        ) : (
          'تسجيل الدخول'
        )}
      </button>
    </form>
  )

  if (reactivate && reactivate.phase !== 'done') {
    const confirming = reactivate.phase === 'confirming'
    return (
      <AuthShell
        title="إعادة تفعيل الحساب"
        subtitle="إعادة تفعيل حساب النشاط"
        footer={
          <button
            type="button"
            className="auth-link"
            onClick={() => {
              setReactivate(null)
              setPassword('')
            }}
            disabled={confirming}
          >
            العودة لتسجيل الدخول
          </button>
        }
      >
        {confirming ? (
          <div className="auth-react-state">
            <Loader2 className="auth-spin react-state-spin" />
            <p>جارٍ إعادة تفعيل الحساب...</p>
          </div>
        ) : (
          <div className="reactivate-box">
            <span className="reactivate-ic">
              <AlertTriangle />
            </span>
            <h2>حسابك موقوف مؤقتاً</h2>
            <p>
              تم تعطيل الحساب المرتبط بـ <b dir="ltr">{reactivate.email}</b>. هل تريد إعادة تفعيله للعودة إلى لوحة التحكم؟
            </p>
            <button className="btn btn-primary btn-block" type="button" onClick={handleReactivate}>
              <CheckCircle2 /> نعم، أعد تفعيل حسابي
            </button>
          </div>
        )}
      </AuthShell>
    )
  }

  if (reactivate && reactivate.phase === 'done') {
    return (
      <AuthShell
        title="تمت إعادة التفعيل"
        subtitle="أصبح حسابك نشطاً مرة أخرى"
        footer={
          <button
            type="button"
            className="auth-link"
            onClick={() => {
              setReactivate(null)
              setPassword('')
            }}
          >
            العودة لتسجيل الدخول
          </button>
        }
      >
        <div className="auth-success">
          <span className="auth-suc-ic">
            <CheckCircle2 />
          </span>
          <p>تمت إعادة تفعيل حساب نشاطك بنجاح. سجّل الدخول الآن لمتابعة إدارة حجوزاتك.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setReactivate(null)
              setPassword('')
            }}
          >
            <button className="btn btn-primary btn-block" type="submit">
              العودة لتسجيل الدخول
            </button>
          </form>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="تسجيل الدخول"
      subtitle="سجّل دخولك لإدارة حجوزات نشاطك وفريقك."
      footer={
        <p>
          ليس لديك حساب؟{' '}
          <a href={invitation ? `#/invite/${invitation.id}` : '#/signup'} className="auth-link">
            أنشئ حساب نشاطك
          </a>
        </p>
      }
    >
      <div className="info-box">
        <Shield />
        <div>حسابات حجزكوم مخصصة لفريق النشاط فقط (مالك، مشرف، موظف). الزبائن يحجزون دون حساب.</div>
      </div>
      {renderMain()}
    </AuthShell>
  )
}

export default LoginPage
