import { useEffect } from 'react'
import { HeroSection } from './sections/HeroSection'
import { WhoSection } from './sections/WhoSection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { PreviewSection } from './sections/PreviewSection'
import { PricingSection } from './sections/PricingSection'
import { FinalCtaSection } from './sections/FinalCtaSection'

function LandingPage() {
  useEffect(() => {
    document.title = 'حجزكوم | نظام إدارة الحجوزات للصالونات والعيادات'
    return () => {
      document.title = 'حجزكوم | نظام إدارة الحجوزات للصالونات والعيادات'
    }
  }, [])

  return (
    <>
      <HeroSection />
      <WhoSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PreviewSection />
      <PricingSection />
      <FinalCtaSection />
    </>
  )
}

export default LandingPage
