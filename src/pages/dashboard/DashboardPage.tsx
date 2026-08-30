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
  Users,
} from 'lucide-react'
import { BrandIcon } from '../../components/marketing/BrandMark'
import { clearSession, getSession, type Session, type AccountRole } from '../../utils/accounts'
import { getBusinessByOwner, getBusinessById, type Business } from '../../utils/business'
import { getAccountByEmail } from '../../utils/accounts'
import { DashboardHome } from './DashboardHome'
import { ServicesPage } from './ServicesPage'
import { LocationsPage } from './LocationsPage'
import { BusinessSettingsPage } from './BusinessSettingsPage'
import { TeamPage } from './TeamPage'

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
  return parts[1] ?? 'home'
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

  const pageTitles: Record<string, string> = {
    home: 'الرئيسية',
    calendar: 'التقويم',
    customers: 'الزبائن',
    services: 'الخدمات',
    team: 'الفريق',
    locations: 'المواقع والأوقات',
    settings: 'إعدادات النشاط',
    billing: 'الاشتراك والفوترة',
  }

  const handleRefresh = () => setRefreshKey((k) => k + 1)

  const renderContent = () => {
    switch (subPage) {
      case 'home':
        return <DashboardHome session={session} business={business} />
      case 'calendar':
        return <Placeholder title="التقويم" desc="عرض وإدارة حجوزاتك اليومية والأسبوعية." />
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
          <button className="dash-burger" type="button" onClick={() => setSidebarOpen(true)}>
            <Menu />
          </button>
          <h2 className="dash-head-title">{pageTitles[subPage] ?? 'لوحة التحكم'}</h2>
          <div className="dash-head-spacer" />
          <div className="dash-head-user">
            <span className="dash-head-avatar">
              <User />
            </span>
            <span>{session.fullName.split(' ')[0]}</span>
          </div>
        </header>

        <div className="dash-body">{renderContent()}</div>
      </div>
    </div>
  )
}

export default DashboardPage
