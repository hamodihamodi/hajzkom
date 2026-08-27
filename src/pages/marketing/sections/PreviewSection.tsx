import { useEffect, useRef, useState } from 'react'
import {
  Banknote,
  BarChart3,
  Bell,
  CalendarCheck,
  CalendarDays,
  Check,
  Clock,
  Download,
  Gauge,
  LayoutDashboard,
  Lock,
  MousePointerClick,
  Plus,
  Scissors,
  Settings,
  UserCog,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Reveal } from '../../../components/marketing/Reveal'
import { BrandIcon } from '../../../components/marketing/BrandMark'
import { toast } from '../../../utils/toast'

type RowStatus = 'pend' | 'conf' | 'done' | 'canc'

type DayRow = {
  id: number
  time: string
  avatar: string
  name: string
  meta: string
  status: RowStatus
}

const STATUS_PILL: Record<RowStatus, { className: string; label: string }> = {
  pend: { className: 'p-pend', label: 'قيد الانتظار' },
  conf: { className: 'p-conf', label: 'مؤكد' },
  done: { className: 'p-done', label: 'مكتمل' },
  canc: { className: 'p-canc', label: 'ملغى' },
}

const INITIAL_ROWS: DayRow[] = [
  { id: 1, time: '3:30', avatar: 'س', name: 'سيف عبدالله', meta: 'قص وتصفيف · مع كرار', status: 'pend' },
  { id: 2, time: '4:15', avatar: 'ن', name: 'نور أحمد', meta: 'مكياج مناسبات · مع ريم', status: 'conf' },
  { id: 3, time: '5:00', avatar: 'ف', name: 'فاطمة علي', meta: 'عناية بالبشرة · مع دانا', status: 'conf' },
  { id: 4, time: '6:30', avatar: 'م', name: 'محمد حسين', meta: 'حلاقة ذقن · مع كرار', status: 'done' },
  { id: 5, time: '7:15', avatar: 'ر', name: 'رنا خالد', meta: 'صبغة كاملة · مع دانا', status: 'canc' },
]

const DEMO_BOOKINGS = [
  { name: 'سارة جاسم', meta: 'تنظيف بشرة · مع دانا', time: '7:00' },
  { name: 'حسن علي', meta: 'قص شعر · مع كرار', time: '7:45' },
  { name: 'ملاك صباح', meta: 'مكياج مناسبات · مع ريم', time: '8:30' },
]

const SIDE_NAV = [
  { Icon: LayoutDashboard, label: 'لوحة التحكم', active: true },
  { Icon: CalendarDays, label: 'المواعيد', active: false },
  { Icon: Users, label: 'العملاء', active: false },
  { Icon: Scissors, label: 'الخدمات', active: false },
  { Icon: UserCog, label: 'الفريق', active: false },
  { Icon: BarChart3, label: 'التقارير', active: false },
  { Icon: Settings, label: 'الإعدادات', active: false },
]

const WEEK_COLUMNS = [
  { day: 'سبت', today: false, cells: [{ type: 'done', time: '9:00', text: 'قص' }, { type: 'done', time: '11:00', text: 'صبغة' }, { type: 'free', text: 'حجوزات مكتملة' }] },
  { day: 'أحد', today: false, cells: [{ type: 'conf', time: '10:00', text: 'مكياج' }, { type: 'free', text: '+3 أوقات متاحة' }] },
  { day: 'اثنين', today: false, cells: [{ type: 'pend', time: '4:30', text: 'عناية' }, { type: 'conf', time: '6:00', text: 'قص' }] },
  { day: 'ثلاثاء', today: false, cells: [{ type: 'conf', time: '9:30', text: 'استشارة' }, { type: 'free', text: 'يوم هادئ' }] },
  { day: 'أربعاء', today: false, cells: [{ type: 'conf', time: '5:00', text: 'صبغة' }, { type: 'pend', time: '7:00', text: 'حلاقة' }] },
  { day: 'خميس', today: false, cells: [{ type: 'conf', time: '3:00', text: 'باقة' }, { type: 'conf', time: '4:30', text: 'مكياج' }, { type: 'free', text: '+1 وقت متاح' }] },
  { day: 'جمعة', today: true, cells: [{ type: 'conf', time: '3:45', text: 'مكياج' }, { type: 'conf', time: '4:15', text: 'عناية' }, { type: 'free', text: '5:00 متاح' }] },
] as const

function formatClock(date: Date): string {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function PreviewSection() {
  const [view, setView] = useState<'day' | 'week'>('day')
  const [rows, setRows] = useState<DayRow[]>(INITIAL_ROWS)
  const [bookingsCount, setBookingsCount] = useState(24)
  const [clock, setClock] = useState(() => formatClock(new Date()))
  const demoIndex = useRef(0)
  const rowId = useRef(INITIAL_ROWS.length)

  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()))
    tick()
    const interval = window.setInterval(tick, 30000)
    return () => window.clearInterval(interval)
  }, [])

  const completeRow = (id: number) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status: 'done' } : row)))
    toast('تم إكمال الموعد وتحديث سجل الزبون.')
  }

  const cancelRow = (id: number) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status: 'canc' } : row)))
    toast('تم إلغاء الموعد وإشعار الزبون عبر واتساب.', false)
  }

  const addManualBooking = () => {
    const demo = DEMO_BOOKINGS[demoIndex.current % DEMO_BOOKINGS.length]
    demoIndex.current += 1
    rowId.current += 1
    setRows((current) => [
      { id: rowId.current, avatar: demo.name.charAt(0), name: demo.name, meta: demo.meta, time: demo.time, status: 'conf' },
      ...current,
    ])
    setBookingsCount((current) => current + 1)
    toast('تمت إضافة الحجز يدوياً — وأُرسل تأكيد للزبون.')
  }

  return (
    <section className="section section-preview" id="preview">
      <div className="container">
        <Reveal className="sec-head center">
          <span className="eyebrow">معاينة حيّة</span>
          <h2>لوحة تحكم يفتحها فريقك كل صباح</h2>
          <p className="sec-sub">شاشة المالك والمشرف والموظف: جدول اليوم، الإحصاءات، وإجراءات سريعة — جرّبها بنفسك الآن.</p>
        </Reveal>
        <Reveal className="preview-wrap">
          <div className="anno anno-1">
            <Zap /> كل حجز جديد يظهر هنا فوراً وصولاً من صفحة الحجز
          </div>
          <div className="anno anno-2">
            <Users /> ما يراه كل موظف تحدده أنت من صلاحيات الفريق
          </div>
          <div className="browser">
            <div className="browser-bar">
              <div className="dots">
                <span />
                <span />
                <span />
              </div>
              <div className="url">
                <Lock />
                <span className="ltr">app.hajzkom.iq/dashboard</span>
              </div>
            </div>
            <div className="dash">
              <aside className="dash-side">
                <div className="side-logo">
                  <BrandIcon size={26} />
                  <span>
                    <b>حجز</b>كوم
                  </span>
                </div>
                <nav className="side-nav" aria-label="قائمة اللوحة">
                  {SIDE_NAV.map(({ Icon, label, active }) => (
                    <a href="#preview" className={`side-item${active ? ' active' : ''}`} key={label}>
                      <Icon /> {label}
                    </a>
                  ))}
                </nav>
                <div className="side-user">
                  <span className="side-av">س</span>
                  <div>
                    <b>سيف الحسيني</b>
                    <small>مالك — كل الصلاحيات</small>
                  </div>
                </div>
              </aside>
              <div className="dash-main">
                <div className="dash-top">
                  <div>
                    <h3>أهلاً، سيف</h3>
                    <p>هذه حالة نشاطك اليوم — الجمعة 14 حزيران</p>
                    <span className="dash-clock">
                      <Clock /> الساعة الآن <b>{clock}</b>
                    </span>
                  </div>
                  <div className="dash-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => toast('تم تجهيز جدول اليوم للتنزيل بصيغة CSV.')}
                    >
                      <Download /> تصدير
                    </button>
                    <button className="btn btn-primary btn-sm" type="button" onClick={addManualBooking}>
                      <Plus /> حجز جديد
                    </button>
                  </div>
                </div>
                <div className="stats">
                  <div className="stat">
                    <div className="stat-top">
                      <span className="stat-ic si-a">
                        <CalendarCheck />
                      </span>
                      حجوزات اليوم
                    </div>
                    <b>
                      <span>{bookingsCount}</span> حجزاً
                    </b>
                    <small>+3 عن أمس</small>
                  </div>
                  <div className="stat">
                    <div className="stat-top">
                      <span className="stat-ic si-b">
                        <Banknote />
                      </span>
                      إيراد اليوم المتوقع
                    </div>
                    <b>465,000 د.ع</b>
                    <small>+8% عن أمس</small>
                  </div>
                  <div className="stat">
                    <div className="stat-top">
                      <span className="stat-ic si-a">
                        <Gauge />
                      </span>
                      نسبة الإشغال
                    </div>
                    <b>78%</b>
                    <small>الأفضل هذا الأسبوع</small>
                  </div>
                  <div className="stat">
                    <div className="stat-top">
                      <span className="stat-ic si-a">
                        <Bell />
                      </span>
                      تذكيرات مُسلَّمة
                    </div>
                    <b>96%</b>
                    <small>عبر واتساب</small>
                  </div>
                </div>
                <div className="dash-tabs" role="tablist" aria-label="طريقة العرض">
                  <button
                    className={`dash-tab${view === 'day' ? ' active' : ''}`}
                    data-view="day"
                    role="tab"
                    aria-selected={view === 'day'}
                    type="button"
                    onClick={() => setView('day')}
                  >
                    جدول اليوم
                  </button>
                  <button
                    className={`dash-tab${view === 'week' ? ' active' : ''}`}
                    data-view="week"
                    role="tab"
                    aria-selected={view === 'week'}
                    type="button"
                    onClick={() => setView('week')}
                  >
                    نظرة الأسبوع
                  </button>
                </div>

                {view === 'day' ? (
                  <div className="d-rows">
                    {rows.map((row) => (
                      <div className={`d-row${row.status === 'canc' ? ' st-canc' : ''}`} key={row.id}>
                        <div className="d-time">{row.time}</div>
                        <div className="d-cli">
                          <span className="d-av">{row.avatar}</span>
                          <div>
                            <div className="d-name">{row.name}</div>
                            <div className="d-meta">{row.meta}</div>
                          </div>
                        </div>
                        <span className={`pill ${STATUS_PILL[row.status].className}`}>{STATUS_PILL[row.status].label}</span>
                        <div className="d-act">
                          <button className="act ok" title="إكمال" type="button" onClick={() => completeRow(row.id)}>
                            <Check />
                          </button>
                          <button className="act bad" title="إلغاء" type="button" onClick={() => cancelRow(row.id)}>
                            <X />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="wk">
                    {WEEK_COLUMNS.map((column) => (
                      <div className={`wk-col${column.today ? ' today' : ''}`} key={column.day}>
                        <div className="wk-head">{column.day}</div>
                        {column.cells.map((cell, index) => (
                          <div className={`wb wb-${cell.type}`} key={`${column.day}-${index}`}>
                            {'time' in cell && cell.time ? <b>{cell.time}</b> : null}
                            {cell.text}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hint">
            <MousePointerClick /> معاينة تفاعلية — بدّل بين (اليوم / الأسبوع)، ونفّذ إجراءات الإكمال أو الإلغاء على أي موعد.
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default PreviewSection
