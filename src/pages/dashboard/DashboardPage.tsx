import { useEffect, useState } from 'react'
import {
  CalendarDays,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Scissors,
  Settings,
  UserCog,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import { BrandIcon } from '../../components/marketing/BrandMark'
import { clearSession, getSession, type Session, type AccountRole } from '../../utils/accounts'
import {
  getBusinessByOwner,
  getBusinessById,
  appointmentLimitForPlan,
  getActiveLocationId,
  setActiveLocationId,
  type Business,
} from '../../utils/business'
import { getAccountByEmail } from '../../utils/accounts'
import { getAppointmentsForBusiness } from '../../utils/appointments'
import { toast } from '../../utils/toast'
import { DashboardHome } from './DashboardHome'
import { ServicesPage } from './ServicesPage'
import { LocationsPage } from './LocationsPage'
import { BusinessSettingsPage } from './BusinessSettingsPage'
import { TeamPage } from './TeamPage'
import { CalendarPage } from './CalendarPage'
import { AppointmentDetailPage } from './AppointmentDetailPage'
import { RescheduleAppointmentPage } from './RescheduleAppointmentPage'
import { WalkInBookingPage } from './WalkInBookingPage'

const PLAN_AR: Record<string, string> = {
  free: 'مجانية',
  pro: 'احترافية',
  max: 'ماكس',
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'مالك النشاط',
  admin: 'مشرف',
  staff: 'موظف',
}

interface NavItem {
  key: string
  label: string
  icon: typeof Home
  roles: AccountRole[]
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'الرئيسية', icon: Home, roles: ['owner', 'admin', 'staff'] },
  { key: 'walkin', label: 'حجز مباشر', icon: UserPlus, roles: ['owner', 'admin', 'staff'] },
  { key: 'calendar', label: 'التقويم', icon: CalendarDays, roles: ['owner', 'admin'] },
  { key: 'customers', label: 'الزبائن', icon: Users, roles: ['owner', 'admin'] },
  { key: 'services', label: 'الخدمات', icon: Scissors, roles: ['owner', 'admin'] },
  { key: 'team', label: 'الفريق', icon: UserCog, roles: ['owner', 'admin', 'staff'] },
  { key: 'locations', label: 'المواقع والأوقات', icon: MapPin, roles: ['owner', 'admin'] },
  { key: 'settings', label: 'إعدادات النشاط', icon: Settings, roles: ['owner', 'admin'] },
  { key: 'billing', label: 'الاشتراك والفوترة', icon: CreditCard, roles: ['owner'] },
]

function getSubPage(): string {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const [path] = hash.split('?')
  const parts = path.split('/')
  if (parts[0] === 'schedule') return 'home'
  if (parts[1] === 'appointment' && parts[2] && parts[3] === 'reschedule') return 'reschedule'
  if (parts[1] === 'appointment' && parts[2]) return 'appointment'
  return parts[1] ?? 'home'
}

function getAppointmentIdFromHash(): string | null {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const parts = hash.split('/')
  if (parts[1] === 'appointment' && parts[2]) return parts[2]
  return null
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="dash-placeholder">
      <div className="dash-ph-inner">
        <span className="dash-ph-ic">
          <LayoutDashboard />
        </span>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [session, setSession] = useState<Session | null>(() => getSession())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [subPage, setSubPage] = useState(getSubPage)
  const [, setRefreshKey] = useState(0)
  const [activeLoc, setActiveLoc] = useState(() => {
    if (!session) return ''
    const biz =
      session.role === 'owner'
        ? getBusinessByOwner(session.accountId)
        : (() => {
            const acc = getAccountByEmail(session.email)
            return acc?.businessId ? getBusinessById(acc.businessId) : null
          })()
    if (!biz) return ''
    const saved = getActiveLocationId(biz.id)
    if (saved && biz.locations.some((l) => l.id === saved)) return saved
    return biz.locations[0]?.id ?? ''
  })

  const business: Business | null = (() => {
    if (!session) return null
    if (session.role === 'owner') return getBusinessByOwner(session.accountId)
    const account = getAccountByEmail(session.email)
    if (account?.businessId) return getBusinessById(account.businessId)
    return null
  })()

  useEffect(() => {
    if (!session) window.location.hash = '#/login'
  }, [session])

  useEffect(() => {
    const onHash = () => {
      setSubPage(getSubPage())
      setSidebarOpen(false)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (!session || !business) return null

  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(session.role))

  const handleLogout = () => {
    clearSession()
    setSession(null)
    window.location.hash = '#/login'
  }

  const handleRefresh = () => setRefreshKey((k) => k + 1)

  const currentBranch = business.locations.find((l) => l.id === activeLoc) ?? business.locations[0] ?? null
  const branchName = currentBranch?.name ?? '—'

  const apptCount = getAppointmentsForBusiness(business.id, business.locations[0]?.id, business.locations[0]?.name)
    .filter((a) => a.status !== 'cancelled').length
  const planLimit = appointmentLimitForPlan(business.plan)
  const showPlanUsage = Number.isFinite(planLimit)

  const renderContent = () => {
    switch (subPage) {
      case 'home':
        return <DashboardHome session={session} business={business} />
      case 'walkin':
        return <WalkInBookingPage business={business} />
      case 'calendar':
        return <CalendarPage business={business} />
      case 'appointment': {
        const apptId = getAppointmentIdFromHash()
        return apptId ? (
          <AppointmentDetailPage
            appointmentId={apptId}
            session={session}
            onBack={() => { window.location.hash = '#/dashboard/calendar' }}
          />
        ) : (
          <CalendarPage business={business} />
        )
      }
      case 'reschedule': {
        const apptId = getAppointmentIdFromHash()
        return apptId ? (
          <RescheduleAppointmentPage
            appointmentId={apptId}
            session={session}
            business={business}
            onBack={() => { window.location.hash = `#/dashboard/appointment/${apptId}` }}
          />
        ) : (
          <CalendarPage business={business} />
        )
      }
      case 'customers':
        return <Placeholder title="الزبائن" desc="إدارة بيانات زبائنك وسجل حجوزاتهم." />
      case 'services':
        return <ServicesPage session={session} business={business} onRefresh={handleRefresh} />
      case 'team':
        return <TeamPage session={session} business={business} onRefresh={handleRefresh} />
      case 'locations':
        return <LocationsPage session={session} business={business} onRefresh={handleRefresh} />
      case 'settings':
        return <BusinessSettingsPage session={session} business={business} onRefresh={handleRefresh} />
      case 'billing':
        return <Placeholder title="الاشتراك والفوترة" desc="إدارة خطتك وطرق الدفع." />
      default:
        return <DashboardHome session={session} business={business} />
    }
  }

  return (
    <div className="dash">
      {/* ── Overlay ── */}
      <div
        className={`dash-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`dash-side${sidebarOpen ? ' open' : ''}`}>
        <a className="dash-side-brand" href="#/">
          <BrandIcon size={30} />
          <span>
            <b>حجز</b>كوم
          </span>
        </a>

        <div className="dash-side-biz">
          <div className="dash-side-biz-name">{business.name}</div>
          {business.locations.length > 1 && session.role !== 'staff' && (
            <div className="dash-side-biz-loc">
              <MapPin /> {business.locations.length} مواقع
            </div>
          )}
          {session.role === 'staff' && business.locations[0] && (
            <div className="dash-side-biz-loc">
              <MapPin /> {business.locations[0].name}
            </div>
          )}
        </div>

        <nav className="dash-nav">
          <div className="dash-nav-label">القائمة</div>
          {filteredNav.map((item) => {
            const Icon = item.icon
            const active = subPage === item.key
            return (
              <a
                key={item.key}
                href={`#/dashboard/${item.key}`}
                className={`dash-nav-item${active ? ' active' : ''}`}
              >
                <Icon />
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="dash-side-user">
          <span className="dash-side-avatar">
            <User />
          </span>
          <div className="dash-side-who">
            <div className="dash-side-name">{session.fullName}</div>
            <div className="dash-side-role">{ROLE_LABEL[session.role] ?? session.role}</div>
          </div>
          <button className="dash-side-logout" type="button" onClick={handleLogout} title="تسجيل الخروج">
            <LogOut />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dash-main">
        <header className="dash-head">
          <button className="dash-burger" type="button" onClick={() => setSidebarOpen(true)} aria-label="فتح القائمة">
            <Menu />
          </button>

          {/* ── الفرع الحالي ── */}
          <div className="dash-head-branch">
            <MapPin size={14} />
            {business.locations.length > 1 ? (
              <select
                value={activeLoc}
                onChange={(e) => {
                  setActiveLoc(e.target.value)
                  setActiveLocationId(business.id, e.target.value)
                }}
                aria-label="الفرع الحالي"
              >
                {business.locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            ) : (
              <span className="dash-head-branch-name">{branchName}</span>
            )}
          </div>

          <div className="dash-head-spacer" />

          {/* ── الخطة + الحجوزات + اللغة ── */}
          <div className="dash-head-end">
            <span className="dash-chip dash-chip-plan" title="الخطة الحالية">
              <CreditCard size={13} />
              {PLAN_AR[business.plan] ?? business.plan}
            </span>
            {showPlanUsage && (
              <span className="dash-chip dash-chip-usage" title="عدد الحجوزات من الحد الأقصى">
                <CalendarDays size={13} />
                {apptCount} / {planLimit}
              </span>
            )}
            <div className="dash-lang" role="group" aria-label="اختيار اللغة">
              <button type="button" className="dash-lang-btn active" aria-pressed="true">عربي</button>
              <button
                type="button"
                className="dash-lang-btn"
                aria-pressed="false"
                onClick={() => toast('النسخة الإنجليزية من الموقع قيد الإعداد حالياً.', false)}
              >
                EN
              </button>
            </div>
          </div>
        </header>

        <div className="dash-body">{renderContent()}</div>
      </div>
    </div>
  )
}

export default DashboardPage
