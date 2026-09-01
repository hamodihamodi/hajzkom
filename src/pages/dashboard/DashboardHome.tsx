import { CalendarDays, Clock, CreditCard, UserPlus, Users, Scissors } from 'lucide-react'
import type { Business } from '../../utils/business'
import type { Session } from '../../utils/accounts'

const MOCK_TODAY = [
  { id: '1', customer: 'أحمد محمد', service: 'قص شعر', time: '10:00', status: 'confirmed' as const },
  { id: '2', customer: 'سارة علي', service: 'صبغ شعر', time: '11:30', status: 'pending' as const },
  { id: '3', customer: 'محمد حسن', service: 'حلاقة', time: '14:00', status: 'confirmed' as const },
]

const STATUS_AR: Record<string, string> = {
  confirmed: 'مؤكد',
  pending: 'قيد الانتظار',
  cancelled: 'ملغى',
}

interface DashboardHomeProps {
  session: Session
  business: Business
}

export function DashboardHome({ session, business }: DashboardHomeProps) {
  const isStaff = session.role === 'staff'
  const locationName = business.locations[0]?.name ?? 'الموقع الرئيسي'

  return (
    <>
      {/* ── Welcome ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px' }}>
          مرحباً {session.fullName.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
          {isStaff
            ? `جدول يومك في ${locationName}`
            : `نظرة عامة على نشاطك — ${business.name}`}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="dash-stats">
        <div className="dash-stat">
          <span className="dash-stat-ic primary">
            <CalendarDays />
          </span>
          <span className="dash-stat-val">3</span>
          <span className="dash-stat-label">حجوزات اليوم</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-ic success">
            <Clock />
          </span>
          <span className="dash-stat-val">12</span>
          <span className="dash-stat-label">هذا الأسبوع</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-ic warning">
            <Users />
          </span>
          <span className="dash-stat-val">45</span>
          <span className="dash-stat-label">هذا الشهر</span>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-ic info">
            <CreditCard />
          </span>
          <span className="dash-stat-val" dir="ltr">
            1.2M
          </span>
          <span className="dash-stat-label">الإيرادات (د.ع)</span>
        </div>
      </div>

      {/* ── Today's appointments ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title">
            <CalendarDays /> حجوزات اليوم
          </span>
          <a href="#/dashboard/calendar" className="dash-section-action">
            عرض الكل <Clock />
          </a>
        </div>
        <div className="dash-section-body">
          {MOCK_TODAY.length === 0 ? (
            <div className="dash-empty">
              <span className="dash-empty-ic">
                <CalendarDays />
              </span>
              <p>لا توجد حجوزات اليوم</p>
            </div>
          ) : (
            MOCK_TODAY.map((appt) => (
              <div key={appt.id} className="dash-appt">
                <span className="dash-appt-time">{appt.time}</span>
                <div className="dash-appt-info">
                  <div className="dash-appt-name">{appt.customer}</div>
                  <div className="dash-appt-svc">{appt.service}</div>
                </div>
                <span className={`dash-appt-status ${appt.status}`}>
                  {STATUS_AR[appt.status] ?? appt.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title">
            <Scissors /> إجراءات سريعة
          </span>
        </div>
        <div className="dash-quick">
          <a href="#/dashboard/walkin" className="dash-quick-btn primary">
            <UserPlus /> حجز مباشر
          </a>
          {!isStaff && (
            <>
              <a href="#/dashboard/services" className="dash-quick-btn">
                <Scissors /> إضافة خدمة
              </a>
              <a href="#/dashboard/customers" className="dash-quick-btn">
                <Users /> إضافة زبون
              </a>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default DashboardHome
