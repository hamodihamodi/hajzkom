import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { LogoLink } from './BrandMark'
import { FacebookIcon, InstagramIcon } from './icons'
import { toastSoon, toastSocial } from '../../utils/toast'

const PRODUCT_LINKS = [
  { href: '#how', label: 'كيف يعمل' },
  { href: '#features', label: 'المزايا' },
  { href: '#preview', label: 'معاينة اللوحة' },
  { href: '#pricing', label: 'الأسعار' },
]

const ACTIVITY_LINKS = [
  { href: '#who', label: 'صالونات التجميل' },
  { href: '#who', label: 'صالونات الحلاقة' },
  { href: '#who', label: 'العيادات' },
]

const COMPANY_LINKS = ['من نحن', 'الأسئلة الشائعة', 'الشروط والأحكام', 'سياسة الخصوصية']

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="f-brand">
            <LogoLink light iconSize={38} />
            <p>
              نظام إدارة الحجوزات للصالونات وصالونات الحلاقة والعيادات في العراق — لصاحب النشاط وفريقه، وزبائنكم يحجزون
              بلا حساب.
            </p>
            <div className="f-contact">
              <a href="mailto:support@hajzkom.iq">
                <Mail />
                <span className="ltr">support@hajzkom.iq</span>
              </a>
              <a href="tel:+9647700000000">
                <Phone />
                <span className="ltr">+964 770 000 0000</span>
              </a>
              <span>
                <MapPin /> بغداد، العراق
              </span>
            </div>
          </div>

          <div className="f-col">
            <h4>المنتج</h4>
            <ul>
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="f-col">
            <h4>الأنشطة</h4>
            <ul>
              {ACTIVITY_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="f-col">
            <h4>الشركة</h4>
            <ul>
              {COMPANY_LINKS.map((label) => (
                <li key={label}>
                  <button type="button" onClick={toastSoon}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 حجزكوم — جميع الحقوق محفوظة. صُنع في العراق.</p>
          <div className="f-social">
            <button type="button" aria-label="انستغرام" onClick={() => toastSocial('انستغرام')}>
              <InstagramIcon />
            </button>
            <button type="button" aria-label="فيسبوك" onClick={() => toastSocial('فيسبوك')}>
              <FacebookIcon />
            </button>
            <button type="button" aria-label="تلغرام" onClick={() => toastSocial('تلغرام')}>
              <Send />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
