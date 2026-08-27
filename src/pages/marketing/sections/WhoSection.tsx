import { useState, type ComponentType } from 'react'
import { Check, Clock, Scissors, Sparkles, Star, Stethoscope } from 'lucide-react'
import { toast } from '../../../utils/toast'

type Service = { name: string; duration: string; price: string }

type Audience = {
  key: 'salon' | 'barber' | 'clinic'
  tabLabel: string
  TabIcon: ComponentType
  title: string
  tagline: string
  description: string
  points: string[]
  chips: string[]
  card: {
    avatar: string
    name: string
    rating: string
    services: Service[]
    times: string[]
    defaultTimeIndex: number
  }
}

const AUDIENCES: Audience[] = [
  {
    key: 'salon',
    tabLabel: 'صالونات التجميل',
    TabIcon: Sparkles,
    title: 'صالونات التجميل',
    tagline: 'خدمات متعددة المدد، وزبائن يعودون إليك',
    description:
      'من التسريحة السريعة إلى مكياج المناسبات الذي يستغرق ساعتين — يتعامل الجدول مع كل خدمة بمدتها الحقيقية ويحجز على المصففة المناسبة تلقائياً.',
    points: [
      'خدمات بمدد وأسعار مختلفة تُحسب تلقائياً في الجدول',
      'تذكير قبل مواعيد المناسبات يقلّل الغياب في أوقات الذروة',
      'سجل لكل زبونة مع تاريخ خدماتها وتفضيلاتها',
    ],
    chips: ['تسريحة مناسبات', 'مكياج', 'صبغة كاملة', 'عناية بالبشرة', 'مانيكير وبديكير'],
    card: {
      avatar: 'ل',
      name: 'صالون لمسة',
      rating: '4.9 · 320 تقييماً',
      services: [
        { name: 'صبغة كاملة', duration: 'ساعتان', price: '45,000 د.ع' },
        { name: 'قص وتصفيف', duration: '45 دقيقة', price: '15,000 د.ع' },
        { name: 'عناية بالبشرة', duration: 'ساعة', price: '30,000 د.ع' },
      ],
      times: ['4:00', '4:30', '6:00', '7:30'],
      defaultTimeIndex: 1,
    },
  },
  {
    key: 'barber',
    tabLabel: 'صالونات الحلاقة',
    TabIcon: Scissors,
    title: 'صالونات الحلاقة',
    tagline: 'طابور منظم بدل الزحام على الكرسي',
    description:
      'بدل ما يقف الزبون بانتظار دوره، يشاركه رابط الحجز ليختار وقته وحلاقه المفضل — وتبقى أنت تدير الكراسي والفريق من شاشة واحدة.',
    points: [
      'جدول مستقل لكل حلاق مع أوقات دوامه واستراحاته',
      'باقات (قص + ذقن) بسعر واحد تُحجز بضغطة واحدة',
      'أوقات الذروة المسائية تمتلئ بدل ما تبقى فاضية',
    ],
    chips: ['قص وتصفيف', 'حلاقة ذقن', 'باقة كاملة', 'غسيل وعلاج فروة', 'قص أطفال'],
    card: {
      avatar: 'أ',
      name: 'صالون الأناقة للحلاقة',
      rating: '4.8 · 540 تقييماً',
      services: [
        { name: 'باقة كاملة (قص + ذقن)', duration: '45 دقيقة', price: '15,000 د.ع' },
        { name: 'قص وتصفيف', duration: '30 دقيقة', price: '10,000 د.ع' },
        { name: 'حلاقة ذقن', duration: '20 دقيقة', price: '5,000 د.ع' },
      ],
      times: ['5:00', '5:30', '6:00', '8:30'],
      defaultTimeIndex: 2,
    },
  },
  {
    key: 'clinic',
    tabLabel: 'العيادات',
    TabIcon: Stethoscope,
    title: 'العيادات',
    tagline: 'مواعيد هادئة، وسجل مرضى منظم',
    description:
      'فترات كافية بين المواعيد حسب نوع الاستشارة، مع سجل زيارات وملاحظات متابعة لكل مريض — وتذكيرات تقلّل المواعيد الضائعة التي تُفرّغ جدولك.',
    points: [
      'مدد مختلفة لكل نوع استشارة أو جلسة علاج',
      'سجل زيارات وملاحظات متابعة لكل مريض',
      'صلاحيات دقيقة تحمي خصوصية بيانات المرضى',
    ],
    chips: ['استشارة عامة', 'جلسة علاج طبيعي', 'تنظيف أسنان', 'متابعة', 'فحص دوري'],
    card: {
      avatar: 'ن',
      name: 'عيادة النور',
      rating: '4.9 · 210 تقييمات',
      services: [
        { name: 'استشارة عامة', duration: '30 دقيقة', price: '25,000 د.ع' },
        { name: 'جلسة علاج طبيعي', duration: 'ساعة', price: '35,000 د.ع' },
        { name: 'متابعة', duration: '15 دقيقة', price: '15,000 د.ع' },
      ],
      times: ['9:00', '9:30', '11:00', '12:30'],
      defaultTimeIndex: 0,
    },
  },
]

function BookingCard({ audience }: { audience: Audience }) {
  const [serviceIndex, setServiceIndex] = useState(0)
  const [timeIndex, setTimeIndex] = useState(audience.card.defaultTimeIndex)

  return (
    <div className="bk-card">
      <div className="bk-head">
        <span className="bk-avatar">{audience.card.avatar}</span>
        <div>
          <strong>{audience.card.name}</strong>
          <span className="bk-sub">
            <Star /> {audience.card.rating}
          </span>
        </div>
        <span className="bk-tag">صفحة عامة</span>
      </div>
      <span className="bk-label">اختر الخدمة</span>
      <div className="bk-services">
        {audience.card.services.map((service, index) => (
          <button
            key={service.name}
            className={`bk-svc${index === serviceIndex ? ' active' : ''}`}
            type="button"
            onClick={() => setServiceIndex(index)}
          >
            <span className="bk-radio" />
            {service.name}
            <span className="bk-svc-meta">
              <Clock /> {service.duration}
            </span>
            <span className="bk-price">{service.price}</span>
          </button>
        ))}
      </div>
      <span className="bk-label">اختر الوقت</span>
      <div className="bk-times">
        {audience.card.times.map((time, index) => (
          <button
            key={time}
            className={`bk-time${index === timeIndex ? ' sel' : ''}`}
            type="button"
            onClick={() => setTimeIndex(index)}
          >
            {time}
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary btn-block bk-confirm"
        type="button"
        onClick={() => toast('تم تأكيد الحجز وإرسال تأكيد واتساب للزبون.')}
      >
        تأكيد الحجز
      </button>
      <div className="bk-note">
        <Check /> بدون تسجيل — تأكيد فوري
      </div>
    </div>
  )
}

export function WhoSection() {
  const [activeKey, setActiveKey] = useState<Audience['key']>('salon')
  const [displayedKey, setDisplayedKey] = useState<Audience['key']>('salon')
  const [fading, setFading] = useState(false)

  const selectAudience = (key: Audience['key']) => {
    if (key === activeKey) return
    setActiveKey(key)
    setFading(true)
    window.setTimeout(() => {
      setDisplayedKey(key)
      setFading(false)
    }, 200)
  }

  const displayed = AUDIENCES.find((a) => a.key === displayedKey) ?? AUDIENCES[0]

  return (
    <section className="section" id="who">
      <div className="container">
        <div className="sec-head reveal in">
          <span className="eyebrow">لمن صُنِع حجزكوم؟</span>
          <h2>ثلاثة نشاطات… ونظام واحد يفهمها كلها</h2>
          <p className="sec-sub">
            سواء كان عملك بالمقص والتصفيف أو بالعلاج والاستشارة، يجهّزك حجزكوم بخدمات وجدول يناسب طبيعة نشاطك. اختر نوع
            نشاطك وشاهد الفرق.
          </p>
        </div>
        <div className="who-tabs reveal in" role="tablist" aria-label="نوع النشاط">
          {AUDIENCES.map(({ key, tabLabel, TabIcon }) => (
            <button
              key={key}
              className={`who-tab${key === activeKey ? ' active' : ''}`}
              data-who={key}
              role="tab"
              aria-selected={key === activeKey}
              type="button"
              onClick={() => selectAudience(key)}
            >
              <TabIcon /> {tabLabel}
            </button>
          ))}
        </div>

        <div className={`who-panel${fading ? ' fade' : ''}`}>
          <div className="who-pane">
            <div className="who-info">
              <h3>{displayed.title}</h3>
              <p className="who-tagline">{displayed.tagline}</p>
              <p className="who-desc">{displayed.description}</p>
              <ul className="who-points">
                {displayed.points.map((point) => (
                  <li key={point}>
                    <Check /> {point}
                  </li>
                ))}
              </ul>
              <span className="who-slabel">قوالب خدمات جاهزة مثل:</span>
              <div className="chip-row">
                {displayed.chips.map((chip) => (
                  <span className="chip" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <BookingCard key={displayed.key} audience={displayed} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhoSection
