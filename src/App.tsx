import { useEffect, useState } from 'react'
import { Toaster } from './components/ui/Toaster'
import MarketingLayout from './layouts/MarketingLayout'
import LandingPage from './pages/marketing/LandingPage'
import { PublicBookingPage } from './pages/public/PublicBookingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import './styles/booking.css'
import './styles/auth.css'

function getRoute(): string {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash || 'home'
}

function renderRoute(route: string) {
  switch (route) {
    case 'booking':
      return <PublicBookingPage />
    case 'signup':
      return <SignupPage />
    case 'login':
      return <LoginPage />
    case 'dashboard':
    case 'schedule':
      return <DashboardPage />
    default:
      return (
        <MarketingLayout>
          <LandingPage />
        </MarketingLayout>
      )
  }
}

function App() {
  const [route, setRoute] = useState<string>(getRoute)

  useEffect(() => {
    const onHash = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      {renderRoute(route)}
      <Toaster />
    </>
  )
}

export default App
