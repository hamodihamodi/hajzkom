import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Bell, CalendarDays, Check, Plus, UserPlus } from 'lucide-react'
import { WhatsAppIcon } from '../../../components/marketing/icons'
import { openSignupModal } from '../../../utils/authModal'

type ApptStatus = 'done' | 'conf'

type Appt = {
  id: number
  time: string
  name: string
  meta: string
  status: ApptStatus
}

const INITIAL_APPTS: Appt[] = [
  { id: 1, time: '3:00', name: 'سيف عبد الله', meta: 'قص وتصفيف · مع كرار', status: 'done' },
  { id: 2, time: '3:45', name: 'نور أحمد', meta: 'مكياج مناسبات · مع ريم', status: 'conf' },
  { id: 3, time: '4:15', name: 'فاطمة علي', meta: 'عناية بالبشرة · مع دانا', status: 'conf' },
]

const LIVE_FEED = [
  { time: '5:00', name: 'مريم سامي', meta: 'مانيكير · مع ريم' },
  { time: '5:30', name: 'علي كريم', meta: 'قص شعر · مع كرار' },
  { time: '6:00', name: 'هدى فاضل', meta: 'تنظيف بشرة · مع دانا' },
  { time: '6:30', name: 'زينب موسى', meta: 'تسريحة مناسبات · مع ريم' },
]

export function HeroSection() {
  const [appts, setAppts] = useState<Appt[]>(INITIAL_APPTS)
  const [count, setCount] = useState(24)
  const [pct, setPct] = useState(78)
  const [toastText, setToastText] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const idRef = useRef(INITIAL_APPTS.length)

  useEffect(() => {
    let feedIdx = 0
    let intervalId: number | undefined
    const pending: number[] = []

    const cycle = () => {
      const booking = LIVE_FEED[feedIdx % LIVE_FEED.length]
      feedIdx += 1
      setToastText(`${booking.name} — ${booking.meta} الساعة ${booking.time}`)
      setToastShow(true)
      pending.push(
        window.setTimeout(() => {
          setToastShow(false)
          idRef.current += 1
          const next: Appt = { id: idRef.current, status: 'conf', ...booking }
          setAppts((current) => {
            const list = [...current, next]
            return list.length > 4 ? list.slice(list.length - 4) : list
          })
          setCount((c) => c + 1)
          setPct(Math.min(96, 78 + Math.floor(feedIdx / 2)))
        }, 2600),
      )
    }

    const starter = window.setTimeout(() => {
      cycle()
      intervalId = window.setInterval(cycle, 5200)
    }, 1800)

    return () => {
      window.clearTimeout(starter)
      if (intervalId !== undefined) window.clearInterval(intervalId)
      pending.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  return (
    <section className="hero" id="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">منصة عراقية لإدارة الحجوزات</span>
          <h1>
            استقبل <span className="hl">الحجوزات</span>،
            <br />
            لا المكالمات الهاتفية.
          </h1>
          <p className="hero-sub">
            حجزكوم يمنح نشاطك صفحة حجز ذكية يستخدمها زبائنك <strong>دون أي حساب</strong>، ويمنحك أنت وفريقك جدولاً يومياً
            منظماً مع تذكيرات واتساب تلقائية تُقلّل الغياب.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" type="button" onClick={() => openSignupModal()}>
              <UserPlus /> أنشئ حساب نشاطك
            </button>
            <a className="btn btn-ghost btn-lg" href="#how">
              كيف يعمل؟ <ArrowLeft />
            </a>
          </div>
          <a className="hero-demo-link" href="#booking">
            جرّب صفحة حجز زبونك مباشرة <ArrowLeft />
          </a>
          <ul className="hero-trust">
            <li>
              <Check /> ابدأ مجاناً
            </li>
            <li>
              <Check /> بدون بطاقة ائتمانية
            </li>
            <li>
              <Check /> إعداد خلال 5 دقائق
            </li>
          </ul>
          <div className="hero-stats">
            <div>
              <strong>+840</strong>
              <span>نشاطاً تجارياً يدير مواعيده عبر حجزكوم</span>
            </div>
            <div>
              <strong>40%</strong>
              <span>انخفاض في حالات عدم الحضور</span>
            </div>
            <div>
              <strong>96%</strong>
              <span>من التذكيرات تُسلَّم بنجاح</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-deco" />
          <div className="hero-pattern" />
          <div className="mock-card">
            <div className="mock-head">
              <span className="mock-ic">
                <CalendarDays />
              </span>
              <div className="mock-title">
                <strong>مواعيد اليوم</strong>
                <span>الجمعة 14 حزيران</span>
              </div>
              <span className="live-pill">
                <span className="live-dot" /> مباشر
              </span>
            </div>
            <div className="appt-list">
              {appts.map((appt) => (
                <div className={`appt${appt.id > INITIAL_APPTS.length ? ' new' : ''}`} key={appt.id}>
                  <div className="appt-time">{appt.time}</div>
                  <div>
                    <div className="appt-name">{appt.name}</div>
                    <div className="appt-meta">{appt.meta}</div>
                  </div>
                  <span className={`pill ${appt.status === 'done' ? 'p-done' : 'p-conf'}`}>
                    {appt.status === 'done' ? 'مكتمل' : 'مؤكد'}
                  </span>
                </div>
              ))}
              <div className="free-slot">
                <Plus /> 5:00 — متاح للحجز من رابطك
              </div>
            </div>
            <div className="mock-foot">
              <div className="occ-head">
                <span>إشغال اليوم</span>
                <strong>
                  <b>{count}</b> حجزاً · <b>{pct}</b>%
                </strong>
              </div>
              <div className="occ-bar">
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
          <div className={`toast-booking${toastShow ? ' show' : ''}`}>
            <span className="tb-ic">
              <Bell />
            </span>
            <div>
              <strong>حجز جديد من صفحتك</strong>
              <span>{toastText}</span>
            </div>
          </div>
          <div className="float-chip">
            <WhatsAppIcon /> تم إرسال تذكير واتساب <Check />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
