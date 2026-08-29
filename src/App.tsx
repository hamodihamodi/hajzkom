import { useEffect, useState } from 'react'
import { Toaster } from './components/ui/Toaster'
import MarketingLayout from './layouts/MarketingLayout'
import LandingPage from './pages/marketing/LandingPage'
import { PublicBookingPage } from './pages/public/PublicBookingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { AcceptInvitationPage } from './pages/auth/AcceptInvitationPage'
import { InvitationInvalidPage } from './pages/auth/InvitationInvalidPage'
import { CreateBusinessPage } from './pages/onboarding/CreateBusinessPage'
import { lookupInvitation, isInviteValid } from './utils/invites'
import { getSession } from './utils/accounts'
import { getBusinessByOwner } from './utils/business'

import './styles/booking.css'
import './styles/auth.css'
import './styles/onboarding.css'

function parseLocation() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const [pathPart, query = ''] = hash.split('?')
  const params = new URLSearchParams(query)
  let path = pathPart
  let inviteFromPath: string | null = null
  if (pathPart.startsWith('invite/')) {
    inviteFromPath = pathPart.slice('invite/'.length).split('/')[0] || null
    path = 'invite'
  }
  return {
    path,
    invite: params.get('invite') ?? inviteFromPath,
    login: params.get('login') === '1',
  }
}

function renderRoute() {
  const { path, invite, login } = parseLocation()

  switch (path) {
    case 'booking':
      return <PublicBookingPage />
    case 'signup':
      return <SignupPage invitationId={invite ?? undefined} />
    case 'login':
      return <LoginPage invitationId={invite ?? undefined} />
    case 'accept-invite':
      return <AcceptInvitationPage invitationId={invite ?? undefined} />
    case 'onboarding':
      return <CreateBusinessPage />
    case 'schedule':
    case 'dashboard': {
      const session = getSession()
      if (session?.role === 'owner' && !getBusinessByOwner(session.accountId)) {
        window.location.hash = '#/onboarding'
        return <CreateBusinessPage />
      }
      return <DashboardPage />
    }

    case 'invite': {
      const id = invite
      if (!id) return <InvitationInvalidPage invitation={null} />
      const invitation = lookupInvitation(id)
      if (!invitation || !isInviteValid(invitation)) {
        return <InvitationInvalidPage invitation={invitation} />
      }
      if (login) {
        return <LoginPage invitationId={id} />
      }
      return <AcceptInvitationPage invitationId={id} />
    }

    default:
      return (
        <MarketingLayout>
          <LandingPage />
        </MarketingLayout>
      )
  }
}

function App() {
  const [, setTicker] = useState(0)

  useEffect(() => {
    const onHash = () => setTicker((t) => t + 1)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      {renderRoute()}
      <Toaster />
    </>
  )
}

export default App
