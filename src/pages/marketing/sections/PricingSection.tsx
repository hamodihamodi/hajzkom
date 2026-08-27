import { useState } from 'react'
import { Check, Minus, Star } from 'lucide-react'
import { Reveal } from '../../../components/marketing/Reveal'
import { openSignupModal } from '../../../utils/authModal'

type Billing = 'm' | 'y'
type PlanKey = 'free' | 'pro' | 'max'

const PRICES: Record<PlanKey, Record<Billing, string>> = {
  free: { m: '0', y: '0' },
  pro: { m: '15,000', y: '150,000' },
  max: { m: '36,000', y: '360,000' },
}

const UNITS: Record<Billing, string> = {
  m: 'د.ع / شهرياً',
  y: 'د.ع / سنوياً',
}

const BILLING_NOTES: Record<PlanKey, Record<Billing, string>> = {
  free: {
    m: 'لا تحتاج بطاقة ائتمانية',
    y: 'مجانية للأبد — سنوياً وشهرياً',
  },
  pro: {
    m: 'تُدفع شهرياً — بإمكانك الإلغاء بأي وقت',
    y: 'تُدفع سنوياً — وفّرت قيمة شهرين',
  },
  max: {
    m: 'تُدفع شهرياً — بإمكانك الإلغاء بأي وقت',
    y: 'تُدفع سنوياً — وفّرت قيمة شهرين',
  },
}

const PLANS: Array<{
  key: PlanKey
  name: string
  description: string
  features: string[]
  cta: string
  ctaClass: string
}> = [
  {
    key: 'free',
    name: 'مجاني',
    description: 'لتبدأ وتجرّب النظام على نشاطك الصغير',
    features: ['صفحة حجز عامة لزبائنك', 'حتى عضوين في الفريق', 'حتى 100 حجز شهرياً', 'تذكيرات يدوية عبر واتساب'],
    cta: 'ابدأ مجاناً',
    ctaClass: 'btn-ghost',
  },
  {
    key: 'pro',
    name: 'برو',
    description: 'للنشاطات المزدحمة التي تريد تنظيماً كاملاً',
    features: [
      'كل مزايا الخطة المجانية',
      'حتى 8 أعضاء وفرعين',
      '1,000 حجز شهرياً + تذكيرات تلقائية',
      'مزامنة Google Calendar',
      'تقارير متقدمة وإحصاءات',
    ],
    cta: 'اشترك في برو',
    ctaClass: 'btn-light',
  },
  {
    key: 'max',
    name: 'ماكس',
    description: 'للسلاسل والنشاطات متعددة الفروع — بلا حدود',
    features: [
      'كل مزايا برو — بلا حدود',
      'أعضاء وحجوزات وفروع غير محدودة',
      'علامة بيضاء وقوالب تذكير خاصة',
      'مدير حساب ودعم مباشر عبر واتساب',
    ],
    cta: 'اشترك في ماكس',
    ctaClass: 'btn-primary',
  },
]

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>('m')

  return (
    <section className="section" id="pricing">
      <div className="container">
        <Reveal className="pricing-top">
          <div className="sec-head center" style={{ marginBottom: 0 }}>
            <span className="eyebrow">الأسعار</span>
            <h2>ابدأ مجاناً، وادفع فقط عندما يكبر نشاطك</h2>
            <p className="sec-sub">أسعار بالدينار العراقي، بلا رسوم خفية — ترقية أو إلغاء في أي وقت.</p>
          </div>
          <div className="bill-toggle">
            <div className="bill-switch">
              <button
                className={`bill-btn${billing === 'm' ? ' active' : ''}`}
                data-bill="m"
                type="button"
                onClick={() => setBilling('m')}
              >
                شهري
              </button>
              <button
                className={`bill-btn${billing === 'y' ? ' active' : ''}`}
                data-bill="y"
                type="button"
                onClick={() => setBilling('y')}
              >
                سنوي
              </button>
              <span className="save-badge">شهران مجاناً</span>
            </div>
            <span className="bill-note-txt">اختر الدفع السنوي ووفّر قيمة شهرين كاملين</span>
          </div>
        </Reveal>

        <div className="plans">
          {PLANS.map((plan, index) => (
            <Reveal className={`plan${plan.key === 'pro' ? ' plan-pro' : ''}`} delay={index * 90} key={plan.key}>
              {plan.key === 'pro' && (
                <div className="plan-flag">
                  <Star /> الأكثر اختياراً
                </div>
              )}
              <div className="plan-name">{plan.name}</div>
              <p className="plan-desc">{plan.description}</p>
              <div className="price-row">
                <span className="price">
                  <span className="price-num flip" key={`${plan.key}-${billing}`}>
                    {PRICES[plan.key][billing]}
                  </span>
                </span>
                <span className="price-unit">{UNITS[billing]}</span>
              </div>
              <p className="bill-note">{BILLING_NOTES[plan.key][billing]}</p>
              <hr className="plan-sep" />
              <ul className="plan-feats">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check /> {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`btn ${plan.ctaClass} btn-block`}
                type="button"
                onClick={() => openSignupModal(plan.name)}
              >
                {plan.cta}
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="plan-inc">
          <span className="chip">صفحة الحجز العامة</span>
          <span className="chip">واجهة عربية كاملة</span>
          <span className="chip">تحديثات مجانية</span>
          <span className="chip">بياناتك محفوظة ومشفّرة</span>
        </Reveal>

        <Reveal className="table-wrap">
          <table aria-label="مقارنة الخطط">
            <thead>
              <tr>
                <th>المقارنة</th>
                <th>مجاني</th>
                <th>برو</th>
                <th>ماكس</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>عدد أعضاء الفريق</td>
                <td>2</td>
                <td>8</td>
                <td>غير محدود</td>
              </tr>
              <tr>
                <td>المواعيد شهرياً</td>
                <td>100</td>
                <td>1,000</td>
                <td>غير محدود</td>
              </tr>
              <tr>
                <td>الفروع (المواقع)</td>
                <td>1</td>
                <td>2</td>
                <td>غير محدود</td>
              </tr>
              <tr>
                <td>مدة حفظ البيانات</td>
                <td>90 يوماً</td>
                <td>سنتان</td>
                <td>غير محدودة</td>
              </tr>
              <tr>
                <td>تذكيرات واتساب</td>
                <td>
                  <Minus className="no-ic" />
                </td>
                <td>تلقائية</td>
                <td>تلقائية + قوالب مخصصة</td>
              </tr>
              <tr>
                <td>مزامنة Google Calendar</td>
                <td>
                  <Minus className="no-ic" />
                </td>
                <td>
                  <Check className="ok-ic" />
                </td>
                <td>
                  <Check className="ok-ic" />
                </td>
              </tr>
              <tr>
                <td>التقارير والإحصاءات</td>
                <td>أساسية</td>
                <td>متقدمة</td>
                <td>شاملة + تصدير</td>
              </tr>
              <tr>
                <td>العلامة التجارية</td>
                <td>شعار حجزكوم</td>
                <td>تخصيص الألوان</td>
                <td>علامة بيضاء كاملة</td>
              </tr>
              <tr>
                <td>الدعم</td>
                <td>مركز المساعدة</td>
                <td>أولوية بالبريد</td>
                <td>مدير حساب + واتساب</td>
              </tr>
            </tbody>
          </table>
        </Reveal>
        <p className="price-note">جميع الأسعار بالدينار العراقي (IQD) وتشمل التحديثات والدعم الفني ضمن خطتك.</p>
      </div>
    </section>
  )
}

export default PricingSection
