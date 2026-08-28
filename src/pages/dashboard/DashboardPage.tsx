import { useEffect, useState } from 'react'
import { ArrowRight, LayoutDashboard, LogOut, User } from 'lucide-react'
import { BrandIcon } from '../../components/marketing/BrandMark'
import { clearSession, getSession, type Session } from '../../utils/accounts'

const ROLE_LABEL: Record<string, string> = {
  owner: 'مالك النشاط',
  admin: 'مشرف',
  staff: 'موظف',
}

export function DashboardPage() {
  const [session, setSession] = useState<Session | null>(() => getSession())

  useEffect(() => {
    if (!session) {
      window.location.hash = '#/login'
    }
  }, [session])

  if (!session) {
    return null
  }

  const handleLogout = () => {
    clearSession()
    setSession(null)
    window.location.hash = '#/login'
  }

  return (
    <div className="dash-placeholder">
      <header className="dash-ph-head">
        <a className="auth-brand" href="#/" aria-label="حجزكوم — الرئيسية">
          <BrandIcon size={36} />
          <span className="auth-brand-word">
            <b>حجز</b>كوم
          </span>
        </a>
        <div className="dash-ph-user">
          <span className="dash-ph-avatar">
            <User />
          </span>
          <div className="dash-ph-who">
            <strong>{session.fullName}</strong>
            <span>
              {ROLE_LABEL[session.role] ?? session.role} · <b dir="ltr">{session.email}</b>
            </span>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={handleLogout}>
            <LogOut /> خروج
          </button>
        </div>
      </header>

      <main className="dash-ph-main">
        <div className="dash-ph-card">
          <span className="dash-ph-ic">
            <LayoutDashboard />
          </span>
          <h1>لوحة تحكم {ROLE_LABEL[session.role] ?? 'النشاط'}</h1>
          <p>
            هذه الشاشة قيد الإعداد. تم تسجيل دخولك بنجاح — سيتم بناء لوحة التحكم في المرحلة القادمة لتظهر هنا جدول يومك،
            الخدمات، الفريق، والتقارير.
          </p>
          <a className="btn btn-primary" href="#/">
            <ArrowRight /> العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </main>

      <footer className="dash-ph-foot">© {new Date().getFullYear()} حجزكوم — {session.fullName}</footer>
    </div>
  )
}

export default DashboardPage
