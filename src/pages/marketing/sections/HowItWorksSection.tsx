import { BadgeCheck, Bell, CheckCheck, Copy, Link2, Plus, QrCode } from 'lucide-react'
import { Reveal } from '../../../components/marketing/Reveal'
import { toast } from '../../../utils/toast'

const BOOKING_URL = 'https://hajzkom.iq/lamsa'

function copyBookingUrl() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(BOOKING_URL).then(
      () => toast('تم نسخ رابط الحجز — شاركه مع زبائنك.'),
      () => toast('انسخ الرابط يدوياً: hajzkom.iq/lamsa', false),
    )
  } else {
    toast('انسخ الرابط يدوياً: hajzkom.iq/lamsa', false)
  }
}

export function HowItWorksSection() {
  return (
    <section className="section section-how" id="how">
      <div className="container">
        <Reveal className="sec-head">
          <span className="eyebrow">كيف يعمل</span>
          <h2>من الصفر إلى أول حجز… بثلاث خطوات</h2>
          <p className="sec-sub">لا تحتاج خبرة تقنية ولا أجهزة جديدة — هاتفك وإنترنتك يكفيان.</p>
        </Reveal>
        <div className="steps">
          <Reveal className="step" delay={0}>
            <span className="step-num" dir="ltr">
              01
            </span>
            <h3 className="step-title">أنشئ صفحة نشاطك</h3>
            <p className="step-text">
              أضف خدماتك وأسعارك وأوقات دوام فريقك خلال دقائق — مع قوالب خدمات جاهزة لنوع نشاطك.
            </p>
            <div className="step-visual">
              <div className="svc-chips">
                <span className="chip">قص وتصفيف</span>
                <span className="chip">صبغة كاملة</span>
                <span className="chip">مكياج مناسبات</span>
                <span className="chip add">
                  <Plus /> إضافة خدمة
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal className="step" delay={90}>
            <span className="step-num" dir="ltr">
              02
            </span>
            <h3 className="step-title">شارك رابط الحجز</h3>
            <p className="step-text">
              رابط واحد تشاركه على مواقع التواصل أو تعلّقه في متجرك — زبائنك يحجزون منه مباشرة.
            </p>
            <div className="step-visual">
              <div className="link-bar">
                <Link2 />
                <span className="link-url ltr">hajzkom.iq/lamsa</span>
                <button
                  className="copy-btn"
                  onClick={copyBookingUrl}
                  aria-label="نسخ الرابط"
                  type="button"
                >
                  <Copy />
                </button>
              </div>
              <div className="qr-row">
                <span className="qr-box">
                  <QrCode />
                </span>{' '}
                أو اعرض رمز QR على طاولة الاستقبال
              </div>
              <span className="tag-line">
                <BadgeCheck /> الزبون يحجز بدون تطبيق وبدون حساب
              </span>
            </div>
          </Reveal>

          <Reveal className="step" delay={180}>
            <span className="step-num" dir="ltr">
              03
            </span>
            <h3 className="step-title">استلم واستقبل</h3>
            <p className="step-text">
              يصلك كل حجز على جدولك فوراً، ويُرسل النظام تذكير واتساب تلقائياً قبل الموعد — فيقل الغياب وتنظم الحركة.
            </p>
            <div className="step-visual">
              <div className="notif-card">
                <span className="notif-ic">
                  <Bell />
                </span>
                <div>
                  <strong>تذكير واتساب — قبل الموعد بساعة</strong>
                  <small>يُرسل تلقائياً لكل حجز مؤكد</small>
                </div>
                <span className="delivered" title="تم التسليم">
                  <CheckCheck />
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
