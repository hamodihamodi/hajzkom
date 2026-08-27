import { useEffect, useState } from 'react'
import { LogIn, Menu, UserPlus } from 'lucide-react'
import { LogoLink } from './BrandMark'
import { openLoginModal, openSignupModal } from '../../utils/authModal'
import { toast } from '../../utils/toast'

const NAV_LINKS = [
  { href: '#who', label: 'لمن صُنِع' },
  { href: '#how', label: 'كيف يعمل' },
  { href: '#features', label: 'المزايا' },
  { href: '#preview', label: 'معاينة' },
  { href: '#pricing', label: 'الأسعار' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="container header-inner">
        <LogoLink />
        <nav className="main-nav" aria-label="التنقل الرئيسي">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <div className="lang-switch" role="group" aria-label="اختيار اللغة">
            <button className="lang-btn active" type="button">
              عربي
            </button>
            <button
              className="lang-btn"
              type="button"
              onClick={() => toast('النسخة الإنجليزية من الموقع قيد الإعداد حالياً.', false)}
            >
              EN
            </button>
          </div>
          <button className="btn btn-ghost btn-sm btn-login" type="button" onClick={openLoginModal}>
            <LogIn />
            <span>دخول</span>
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => openSignupModal()}>
            <UserPlus />
            <span>إنشاء حساب</span>
          </button>
          <button
            className="burger"
            type="button"
            aria-label="فتح القائمة"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu />
          </button>
        </div>
      </div>
      <div className={`m-nav${menuOpen ? ' open' : ''}`}>
        <nav aria-label="قائمة الجوال">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="m-actions">
          <button className="btn btn-ghost" type="button" onClick={openLoginModal}>
            <LogIn /> دخول الفريق
          </button>
          <button className="btn btn-primary" type="button" onClick={() => openSignupModal()}>
            <UserPlus /> إنشاء حساب
          </button>
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
