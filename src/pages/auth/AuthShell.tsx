import type { ReactNode } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { BrandIcon } from '../../components/marketing/BrandMark'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="auth-page">
      <header className="auth-top">
        <a className="auth-brand" href="#/" aria-label="حجزكوم — الرئيسية">
          <BrandIcon size={38} />
          <span className="auth-brand-word">
            <b>حجز</b>كوم
          </span>
        </a>
        <a className="auth-back" href="#/">
          <ArrowRight /> العودة للرئيسية
        </a>
      </header>

      <main className="auth-main">
        <div className="auth-card" role="dialog" aria-modal="true" aria-labelledby="authTitle">
          <h1 id="authTitle" className="auth-title">
            {title}
          </h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
        </div>
        <div className="auth-footer">{footer}</div>
      </main>

      <footer className="auth-bottom">
        <span>
          <ShieldCheck /> حسابات حجزكوم لفريق النشاط فقط. الزبائن يحجزون دون حساب عبر رابط حجزهم.
        </span>
        <span>© {new Date().getFullYear()} حجزكوم</span>
      </footer>
    </div>
  )
}
