import { ArrowLeft, Check, UserPlus } from 'lucide-react'
import { Reveal } from '../../../components/marketing/Reveal'
import { openSignupModal } from '../../../utils/authModal'

export function FinalCtaSection() {
  return (
    <section className="cta-final">
      <span className="cta-ghost" aria-hidden="true">
        حجزكوم
      </span>
      <Reveal className="container cta-inner">
        <span className="cta-eyebrow">ابدأ اليوم</span>
        <h2>
          نشاطك يستحق مواعيد <span className="cta-hl">بلا فوضى</span>
        </h2>
        <p>أنشئ حساب نشاطك مجاناً خلال دقائق، شارك رابط الحجز مع زبائنك، واستلم أول حجز اليوم نفسه.</p>
        <button className="btn btn-light btn-lg" type="button" onClick={() => openSignupModal()}>
          <UserPlus /> أنشئ حساب نشاطك — مجاناً
        </button>
        <div className="cta-sub">
          <span>
            <Check /> بدون بطاقة ائتمانية
          </span>
          <span>
            <Check /> إلغاء في أي وقت
          </span>
          <span>
            <Check /> دعم بالعربية
          </span>
        </div>
        <a className="cta-mail" href="mailto:support@hajzkom.iq">
          أو تحدث مع فريقنا أولاً <ArrowLeft />
        </a>
      </Reveal>
    </section>
  )
}

export default FinalCtaSection
