import type { CSSProperties } from 'react'
import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  CheckCheck,
  Link2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
} from 'lucide-react'
import { Reveal } from '../../../components/marketing/Reveal'
import { WhatsAppIcon } from '../../../components/marketing/icons'

const BAR_HEIGHTS = ['88%', '34%', '52%', '66%', '58%', '74%', '92%']
const BAR_LABELS = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة']

function barHeight(value: string): CSSProperties {
  return { '--h': value } as CSSProperties
}

const ROLES = [
  { Icon: ShieldCheck, name: 'مالك', scope: 'كل الصلاحيات' },
  { Icon: UserCog, name: 'مشرف', scope: 'الجدول والتقارير' },
  { Icon: Users, name: 'موظف', scope: 'جدوله فقط' },
]

export function FeaturesSection() {
  return (
    <section className="section" id="features">
      <div className="container">
        <Reveal className="sec-head">
          <span className="eyebrow">المزايا</span>
          <h2>أدوات إدارة تُريح رأسك، لا تزيده</h2>
          <p className="sec-sub">كل ما يحتاجه صاحب النشاط لإدارة المواعيد والفريق والملخص المالي — دون تعقيد.</p>
        </Reveal>
        <div className="bento">
          <Reveal className="tile t-big" delay={0}>
            <div className="tile-head">
              <span className="tile-ic">
                <CalendarCheck />
              </span>
              <h3>جدولة ذكية بلا تعارض</h3>
            </div>
            <p>أوقات دوام، استراحات، ومدد خدمة مختلفة — النظام يحسبها كلها ويمنع حجزين في وقت واحد تلقائياً.</p>
            <div className="tile-visual">
              <div className="slots">
                <div className="slot slot-b">
                  <b>9:00</b> محجوز — قص وتصفيف
                </div>
                <div className="slot slot-f">
                  <b>10:00</b> متاح للحجز
                </div>
                <div className="slot slot-r">
                  <b>10:30</b> استراحة الفريق
                </div>
                <div className="slot slot-b">
                  <b>11:00</b> محجوز — صبغة كاملة
                </div>
                <div className="slot slot-f">
                  <b>12:00</b> متاح للحجز
                </div>
              </div>
              <div className="slot-note">
                <ShieldCheck /> تعارض في المواعيد؟ مستحيل — يحسبها النظام عنك.
              </div>
            </div>
          </Reveal>

          <Reveal className="tile t-wide" delay={90}>
            <div className="tile-head">
              <span className="tile-ic wa">
                <WhatsAppIcon />
              </span>
              <h3>تذكيرات واتساب تلقائية</h3>
            </div>
            <p>تذكير قبل الموعد يصل زبونك مباشرة على واتساب، فيقلّ الغياب لديك حتى 40%.</p>
            <div className="tile-visual">
              <div className="chat">
                <div className="bub bub-out">
                  مرحباً زينب، تذكير بموعدك غداً الساعة 5:00 م — صبغة كاملة مع دانا.
                  <div className="bub-meta">
                    <span>10:30 ص</span>
                    <CheckCheck />
                  </div>
                </div>
                <div className="bub bub-in">
                  شكراً لالتذكير، سأحضر في وقتي.
                  <div className="bub-meta">
                    <span>10:32 ص</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="tile" delay={180}>
            <div className="tile-head">
              <span className="tile-ic">
                <Users />
              </span>
              <h3>صلاحيات الفريق</h3>
            </div>
            <p>مالك ومشرف وموظف — كلٌّ يرى ما يخصه فقط.</p>
            <div className="tile-visual">
              <div className="role-list">
                {ROLES.map(({ Icon, name, scope }) => (
                  <div className="role" key={name}>
                    <Icon />
                    <b>{name}</b>
                    <span>{scope}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal className="tile" delay={270}>
            <div className="tile-head">
              <span className="tile-ic">
                <BarChart3 />
              </span>
              <h3>تقارير واضحة</h3>
            </div>
            <p>الإشغال، أكثر الخدمات طلباً، والإيراد — بلمحة واحدة.</p>
            <div className="tile-visual">
              <div className="bars">
                {BAR_HEIGHTS.map((height, index) => (
                  <span key={height + index} className={`bar${index === BAR_HEIGHTS.length - 1 ? ' today' : ''}`} style={barHeight(height)} />
                ))}
              </div>
              <div className="bars-labels">
                {BAR_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="bars-cap">
                <TrendingUp /> الإشغال الأسبوعي 78% (+12%)
              </div>
            </div>
          </Reveal>

          <Reveal className="tile" delay={360}>
            <div className="tile-head">
              <span className="tile-ic">
                <RefreshCw />
              </span>
              <h3>مزامنة التقويم</h3>
            </div>
            <p>كل حجز جديد يظهر فوراً في Google Calendar.</p>
            <div className="tile-visual">
              <div className="sync-row">
                <span className="sync-node">
                  <span className="sync-ic">
                    <CalendarDays />
                  </span>
                  Google
                </span>
                <span className="sync-arrow">
                  <RefreshCw />
                </span>
                <span className="sync-node">
                  <span className="sync-ic">
                    <CalendarCheck />
                  </span>
                  حجزكوم
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal className="tile t-xwide" delay={450}>
            <div className="tile-flex">
              <div>
                <div className="tile-head">
                  <span className="tile-ic">
                    <Link2 />
                  </span>
                  <h3>زبونك يحجز… بلا حساب ولا تطبيق</h3>
                </div>
                <p>
                  يفتح زبونك رابطك من أي هاتف، يختار الخدمة والوقت، ويصل الحجز إلى لوحتك فوراً — لا تطبيق يُحمَّل، لا
                  تسجيل، لا كلمة مرور. الحسابات في حجزكوم مخصصة لك ولفريقك فقط: مالك، مشرف، أو موظف.
                </p>
              </div>
              <div className="quick-book">
                <div className="qb-url">
                  <Link2 />
                  <span className="ltr">hajzkom.iq/lamsa</span>
                </div>
                <button className="qb-btn" type="button">
                  احجز موعدك الآن
                </button>
                <div className="qb-tag">بدون تسجيل — أقل من دقيقة</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
