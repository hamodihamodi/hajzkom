import type { ReactNode } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { BrandIcon } from '../../components/marketing/BrandMark'

const STEPS = [
  { key: 'business', label: 'النشاط' },
  { key: 'location', label: 'الموقع' },
  { key: 'hours', label: 'الأوقات' },
  { key: 'service', label: 'الخدمة' },
] as const

interface OnboardingShellProps {
  activeStep: number
  children: ReactNode
}

export function OnboardingShell({ activeStep, children }: OnboardingShellProps) {
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
              {i > 0 && <div className={`onboard-line${i < activeStep ? ' done' : ''}`} />}
              <div className={`onboard-step${i === activeStep ? ' active' : ''}${i < activeStep ? ' done' : ''}`}>
                <span className="onboard-dot">
                  {i < activeStep ? <Check /> : i + 1}
                </span>
                <span className="onboard-label">{step.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="onboard-main">{children}</main>

      <footer className="auth-bottom">
        <span>
          <BrandIcon size={15} /> حجزكوم — نظام إدارة الحجوزات
        </span>
        <span>© {new Date().getFullYear()} حجزكوم</span>
      </footer>
    </div>
  )
}
