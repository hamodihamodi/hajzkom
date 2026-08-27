import { useEffect, useState } from 'react'
import MarketingLayout from './layouts/MarketingLayout'
import LandingPage from './pages/marketing/LandingPage'
import { PublicBookingPage } from './pages/public/PublicBookingPage'
import './styles/booking.css'

function getRoute(): string {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash || 'home'
}

function App() {
  const [route, setRoute] = useState<string>(getRoute)

  useEffect(() => {
    const onHash = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route === 'booking') {
    return <PublicBookingPage />
  }

  return (
    <MarketingLayout>
      <LandingPage />
    </MarketingLayout>
  )
}

export default App
