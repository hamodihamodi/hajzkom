import type { ReactNode } from 'react'
import SiteHeader from '../components/marketing/SiteHeader'
import SiteFooter from '../components/marketing/SiteFooter'
import AuthModals from '../components/marketing/AuthModals'
import '../styles/marketing.css'

function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <AuthModals />
    </>
  )
}

export default MarketingLayout
